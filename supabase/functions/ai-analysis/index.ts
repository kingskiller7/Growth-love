import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    let systemPrompt = "";
    let userPrompt = "";

    // Different AI analysis types
    switch (type) {
      case 'market_analysis':
        systemPrompt = `You are an expert cryptocurrency market analyst. Analyze market data and provide insights on trends, support/resistance levels, and potential price movements. Be concise and actionable.`;
        userPrompt = `Analyze this market data for ${data.symbol}:
Current Price: $${data.current_price}
24h Change: ${data.price_change_24h}%
24h High: $${data.high_24h}
24h Low: $${data.low_24h}
Volume: $${data.volume_24h}

Provide a brief analysis with key insights and potential trading opportunities.`;
        break;

      case 'trade_suggestion':
        systemPrompt = `You are an expert cryptocurrency trading advisor. Based on market data and technical indicators, provide specific trade recommendations with entry points, stop loss, and take profit levels. Consider risk management.`;
        userPrompt = `Based on this market data for ${data.symbol}:
Current Price: $${data.current_price}
24h Change: ${data.price_change_24h}%
RSI: ${data.rsi || 'N/A'}
MACD: ${data.macd || 'N/A'}
Volume Trend: ${data.volume_trend || 'N/A'}

Should I buy, sell, or hold? Provide specific levels and reasoning. Keep it under 200 words.`;
        break;

      case 'portfolio_analysis':
        systemPrompt = `You are an expert portfolio manager for cryptocurrency investments. Analyze portfolio allocation and provide rebalancing recommendations considering risk diversification.`;
        userPrompt = `Analyze this portfolio:
${JSON.stringify(data.holdings, null, 2)}

Total Value: $${data.total_value}
24h Change: ${data.change_24h}%

Provide recommendations for optimization and risk management.`;
        break;

      case 'risk_assessment':
        systemPrompt = `You are a cryptocurrency risk management expert. Assess trading risks and provide warnings about potential dangers or market conditions.`;
        userPrompt = `Assess the risk of this trade:
Action: ${data.action}
Symbol: ${data.symbol}
Amount: ${data.amount}
Current Market Conditions: ${JSON.stringify(data.market_conditions)}

Provide a risk assessment and recommendations.`;
        break;

      default:
        throw new Error('Invalid analysis type');
    }

    console.log('Calling AI Gateway with type:', type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    console.log('AI Analysis generated successfully');

    // If this is a trade suggestion, store it in the database
    if (type === 'trade_suggestion' && analysis) {
      // Parse the analysis to extract recommendation
      const isBuy = analysis.toLowerCase().includes('buy') && !analysis.toLowerCase().includes("don't buy");
      const isSell = analysis.toLowerCase().includes('sell') && !analysis.toLowerCase().includes("don't sell");
      const action = isBuy ? 'buy' : isSell ? 'sell' : 'hold';
      
      // Calculate confidence based on keywords
      let confidence = 50;
      if (analysis.toLowerCase().includes('strong')) confidence = 80;
      else if (analysis.toLowerCase().includes('moderate')) confidence = 65;
      else if (analysis.toLowerCase().includes('weak')) confidence = 40;

      const { error: insertError } = await supabase
        .from('ai_suggestions')
        .insert({
          user_id: user.id,
          suggestion_type: 'trade',
          trading_pair: data.symbol,
          action,
          confidence,
          reasoning: analysis,
          status: 'pending',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        });

      if (insertError) {
        console.error('Error storing suggestion:', insertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        type,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ai-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});