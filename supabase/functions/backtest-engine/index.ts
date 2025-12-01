import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BacktestRequest {
  algorithmId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  tradingPairs?: string[];
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

    const { 
      algorithmId, 
      startDate, 
      endDate, 
      initialCapital,
      tradingPairs = ['BTC', 'ETH']
    }: BacktestRequest = await req.json();

    console.log(`Running backtest for algorithm ${algorithmId} from ${startDate} to ${endDate}`);

    // Get algorithm details
    const { data: algorithm, error: algoError } = await supabase
      .from('algorithms')
      .select('*')
      .eq('id', algorithmId)
      .single();

    if (algoError || !algorithm) {
      throw new Error('Algorithm not found');
    }

    // Simulate backtesting (In production, use historical price data)
    const daysDiff = Math.floor(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate simulated trades based on algorithm parameters
    const avgTradesPerDay = 3;
    const totalTrades = daysDiff * avgTradesPerDay;
    const baseWinRate = algorithm.win_rate || 0.6;
    const baseROI = algorithm.roi || 0.05;

    // Simulate performance with some randomness
    let capital = initialCapital;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalProfit = 0;
    let maxDrawdown = 0;
    let peakCapital = capital;
    const trades: any[] = [];

    for (let i = 0; i < totalTrades; i++) {
      const isWin = Math.random() < baseWinRate;
      const profitPercent = isWin 
        ? (Math.random() * 0.05 + baseROI) // Win: 0-5% + base ROI
        : -(Math.random() * 0.03); // Loss: 0-3%

      const tradeProfit = capital * profitPercent;
      capital += tradeProfit;
      totalProfit += tradeProfit;

      if (isWin) {
        winningTrades++;
      } else {
        losingTrades++;
      }

      // Track drawdown
      if (capital > peakCapital) {
        peakCapital = capital;
      }
      const currentDrawdown = (peakCapital - capital) / peakCapital;
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);

      // Sample some trades to return
      if (i % 20 === 0) {
        trades.push({
          trade_number: i + 1,
          date: new Date(new Date(startDate).getTime() + (i / totalTrades) * (new Date(endDate).getTime() - new Date(startDate).getTime())).toISOString(),
          pair: tradingPairs[Math.floor(Math.random() * tradingPairs.length)],
          action: isWin ? 'buy' : 'sell',
          profit: tradeProfit,
          capital_after: capital,
        });
      }
    }

    const finalWinRate = winningTrades / (winningTrades + losingTrades);
    const finalROI = (capital - initialCapital) / initialCapital;
    const avgProfitPerTrade = totalProfit / totalTrades;
    const sharpeRatio = (finalROI / Math.sqrt(maxDrawdown)) * Math.sqrt(252); // Annualized

    const results = {
      algorithm_id: algorithmId,
      algorithm_name: algorithm.name,
      period: {
        start: startDate,
        end: endDate,
        days: daysDiff,
      },
      initial_capital: initialCapital,
      final_capital: capital,
      total_return: capital - initialCapital,
      roi_percent: (finalROI * 100).toFixed(2),
      total_trades: totalTrades,
      winning_trades: winningTrades,
      losing_trades: losingTrades,
      win_rate: (finalWinRate * 100).toFixed(2),
      avg_profit_per_trade: avgProfitPerTrade.toFixed(2),
      max_drawdown: (maxDrawdown * 100).toFixed(2),
      sharpe_ratio: sharpeRatio.toFixed(2),
      sample_trades: trades.slice(0, 10),
    };

    console.log('Backtest completed:', results);

    // Send notification
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Backtest Completed',
        message: `${algorithm.name} backtest finished. ROI: ${results.roi_percent}%, Win Rate: ${results.win_rate}%`,
        type: 'system',
        metadata: { algorithm_id: algorithmId },
      });

    return new Response(
      JSON.stringify(results),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in backtest-engine:', error);
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