import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentTradeRequest {
  agentId: string;
  tradingPair: string;
  action: 'buy' | 'sell';
  amount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { agentId, tradingPair, action, amount }: AgentTradeRequest = await req.json();

    if (!agentId || !tradingPair || !action || !amount) {
      throw new Error('All fields are required');
    }

    console.log(`Agent trade: ${action} ${amount} ${tradingPair} for agent ${agentId}`);

    // Verify agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    if (agent.status !== 'active') {
      throw new Error('Agent is not active');
    }

    // Get market data for AI analysis
    const [baseAsset, quoteAsset] = tradingPair.split('/');
    const { data: marketPrice } = await supabase
      .from('market_prices')
      .select('*')
      .eq('symbol', baseAsset)
      .single();

    if (!marketPrice) {
      throw new Error('Market price not available');
    }

    // Get AI analysis for the trade
    const aiPrompt = `As an AI trading agent, analyze this trade opportunity:
Trading Pair: ${tradingPair}
Action: ${action}
Amount: ${amount}
Current Price: $${marketPrice.price}
24h Change: ${marketPrice.change_24h_percent}%
Agent Strategy: ${agent.strategy}
Risk Level: ${agent.risk_level}

Should this trade be executed? Provide confidence score (0-100) and reasoning.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert cryptocurrency trading AI agent. Analyze trades and provide confidence scores with reasoning." 
          },
          { role: "user", content: aiPrompt }
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    // Extract confidence score from AI response
    const confidenceMatch = analysis.match(/confidence[:\s]+(\d+)/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;

    // Log agent decision
    await supabase
      .from('agent_logs')
      .insert({
        agent_id: agentId,
        log_level: 'info',
        message: `Trade analysis completed: ${action} ${tradingPair}`,
        metadata: {
          confidence,
          analysis: analysis.substring(0, 500),
          price: marketPrice.price,
        },
      });

    // Check if confidence meets agent's threshold
    const minConfidence = agent.config?.min_confidence || 60;
    if (confidence < minConfidence) {
      await supabase
        .from('agent_trades')
        .insert({
          agent_id: agentId,
          trading_pair: tradingPair,
          action,
          amount,
          price: marketPrice.price,
          confidence_score: confidence,
          strategy_used: agent.strategy,
          status: 'cancelled',
          error_message: `Confidence ${confidence}% below threshold ${minConfidence}%`,
        });

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Trade cancelled: confidence below threshold',
          confidence,
          threshold: minConfidence,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_type: 'market',
        order_side: action,
        base_asset: baseAsset,
        quote_asset: quoteAsset || 'USDT',
        amount,
        price: marketPrice.price,
        status: 'open',
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error('Failed to create order');
    }

    // Record agent trade
    const { data: agentTrade } = await supabase
      .from('agent_trades')
      .insert({
        agent_id: agentId,
        order_id: order.id,
        trading_pair: tradingPair,
        action,
        amount,
        price: marketPrice.price,
        confidence_score: confidence,
        strategy_used: agent.strategy,
        status: 'pending',
      })
      .select()
      .single();

    // Execute the trade
    const executionResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/execute-trade`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id }),
      }
    );

    const executionResult = await executionResponse.json();

    if (executionResult.success) {
      // Update agent trade status
      await supabase
        .from('agent_trades')
        .update({
          status: 'executed',
          executed_at: new Date().toISOString(),
        })
        .eq('id', agentTrade.id);

      // Update agent performance
      await supabase.rpc('update_agent_performance', {
        p_agent_id: agentId,
        p_trade_result: {
          success: true,
          profit: 0, // Will be calculated later when position is closed
        },
      });

      console.log(`Agent trade executed successfully: ${executionResult.transaction_hash}`);
    } else {
      // Update agent trade with error
      await supabase
        .from('agent_trades')
        .update({
          status: 'failed',
          error_message: executionResult.error,
        })
        .eq('id', agentTrade.id);
    }

    return new Response(
      JSON.stringify({
        success: executionResult.success,
        message: executionResult.success ? 'Trade executed by agent' : 'Trade execution failed',
        trade: {
          agent_id: agentId,
          order_id: order.id,
          trading_pair: tradingPair,
          action,
          amount,
          price: marketPrice.price,
          confidence,
          transaction_hash: executionResult.transaction_hash,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in agent-trader:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
