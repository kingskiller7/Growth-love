import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StrategistRequest {
  action: 'review_algorithm' | 'optimize_strategy' | 'generate_strategy';
  algorithmId?: string;
  marketConditions?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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

    const { action, algorithmId, marketConditions }: StrategistRequest = await req.json();

    console.log(`Trading Strategist: ${action}`);

    let result: any = {};
    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case 'review_algorithm':
        if (!algorithmId) {
          throw new Error('Algorithm ID required');
        }

        const { data: algorithm } = await supabase
          .from('algorithms')
          .select('*')
          .eq('id', algorithmId)
          .single();

        if (!algorithm) {
          throw new Error('Algorithm not found');
        }

        systemPrompt = `You are an expert trading strategist AI agent. Review trading algorithms and provide detailed analysis on their viability, risk level, and potential performance. Be critical and thorough.`;
        
        userPrompt = `Review this trading algorithm:
Name: ${algorithm.name}
Category: ${algorithm.category}
Description: ${algorithm.description}
Risk Level: ${algorithm.risk_level}/10
Current ROI: ${algorithm.roi}%
Win Rate: ${algorithm.win_rate}%
Total Trades: ${algorithm.total_trades}

Provide a detailed review with:
1. Strengths and weaknesses
2. Risk assessment (1-10)
3. Recommended improvements
4. Approval recommendation (approve/reject/needs_revision)
5. Quality score (1-100)`;

        const reviewResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
          }),
        });

        if (!reviewResponse.ok) {
          throw new Error(`AI Gateway error: ${reviewResponse.status}`);
        }

        const reviewData = await reviewResponse.json();
        const review = reviewData.choices[0].message.content;

        // Parse recommendation
        const shouldApprove = review.toLowerCase().includes('approve') && 
                            !review.toLowerCase().includes('reject');
        
        const qualityMatch = review.match(/quality score[:\s]+(\d+)/i);
        const qualityScore = qualityMatch ? parseInt(qualityMatch[1]) : 50;

        // Auto-approve if quality is high enough and recommendation is positive
        if (shouldApprove && qualityScore >= 70) {
          await supabase
            .from('algorithms')
            .update({
              status: 'active',
              approved_at: new Date().toISOString(),
              approved_by: user.id,
            })
            .eq('id', algorithmId);

          result.status = 'approved';
        } else if (qualityScore < 50) {
          await supabase
            .from('algorithms')
            .update({ status: 'rejected' })
            .eq('id', algorithmId);

          result.status = 'rejected';
        } else {
          result.status = 'needs_revision';
        }

        result.review = review;
        result.quality_score = qualityScore;
        result.algorithm_id = algorithmId;

        // Log the review
        await supabase
          .from('agent_logs')
          .insert({
            agent_id: '00000000-0000-0000-0000-000000000001', // System strategist agent
            log_level: 'info',
            message: `Algorithm ${algorithm.name} reviewed: ${result.status}`,
            metadata: {
              algorithm_id: algorithmId,
              quality_score: qualityScore,
              status: result.status,
            },
          });

        break;

      case 'optimize_strategy':
        if (!algorithmId) {
          throw new Error('Algorithm ID required');
        }

        const { data: strategyAlgo } = await supabase
          .from('algorithms')
          .select('*')
          .eq('id', algorithmId)
          .single();

        if (!strategyAlgo) {
          throw new Error('Algorithm not found');
        }

        systemPrompt = `You are an expert trading strategy optimizer. Analyze trading strategies and suggest concrete improvements to increase performance while managing risk.`;
        
        userPrompt = `Optimize this trading strategy:
Name: ${strategyAlgo.name}
Current Performance:
- ROI: ${strategyAlgo.roi}%
- Win Rate: ${strategyAlgo.win_rate}%
- Risk Level: ${strategyAlgo.risk_level}/10
- Avg Profit per Trade: ${strategyAlgo.avg_profit_per_trade}

Configuration: ${JSON.stringify(strategyAlgo.config, null, 2)}

Provide specific optimization recommendations for:
1. Entry/exit criteria
2. Risk management parameters
3. Position sizing
4. Stop loss/take profit levels
5. Expected improvement in ROI and win rate`;

        const optimizeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
          }),
        });

        if (!optimizeResponse.ok) {
          throw new Error(`AI Gateway error: ${optimizeResponse.status}`);
        }

        const optimizeData = await optimizeResponse.json();
        result.optimization = optimizeData.choices[0].message.content;
        result.algorithm_id = algorithmId;

        break;

      case 'generate_strategy':
        systemPrompt = `You are an expert trading strategy creator. Generate complete trading strategies based on market conditions and risk preferences. Be specific and actionable.`;
        
        userPrompt = `Generate a new trading strategy based on:
Market Conditions: ${JSON.stringify(marketConditions, null, 2)}

Create a detailed strategy including:
1. Strategy name and description
2. Entry criteria (technical indicators, price levels)
3. Exit criteria (profit targets, stop losses)
4. Position sizing rules
5. Risk management (max drawdown, position limits)
6. Expected performance (ROI, win rate estimates)
7. Best trading pairs for this strategy

Format as a structured trading strategy that can be implemented.`;

        const generateResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
          }),
        });

        if (!generateResponse.ok) {
          throw new Error(`AI Gateway error: ${generateResponse.status}`);
        }

        const generateData = await generateResponse.json();
        result.generated_strategy = generateData.choices[0].message.content;

        break;

      default:
        throw new Error('Invalid strategist action');
    }

    console.log('Trading Strategist completed:', action);

    return new Response(
      JSON.stringify({
        success: true,
        action,
        ...result,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in trading-strategist:', error);
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