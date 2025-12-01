import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  type: 'portfolio' | 'trading_performance' | 'agent_performance' | 'system_health';
  timeframe?: string; // '7d', '30d', '90d', 'all'
  userId?: string;
  agentId?: string;
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

    const { type, timeframe = '30d', userId, agentId }: AnalyticsRequest = await req.json();

    console.log(`Analytics request: ${type} for ${timeframe}`);

    // Calculate date range
    const timeframeDays: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': 365 * 10,
    };
    const days = timeframeDays[timeframe] || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let analytics: any = {};

    switch (type) {
      case 'portfolio':
        const targetUserId = userId || user.id;

        // Get portfolio history
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        // Get holdings
        const { data: holdings } = await supabase
          .from('holdings')
          .select('*')
          .eq('portfolio_id', portfolio?.id || '');

        // Get transaction history
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', targetUserId)
          .gte('created_at', startDate)
          .order('created_at', { ascending: true });

        // Calculate metrics
        const totalInvested = transactions?.filter(t => t.transaction_type === 'deposit')
          .reduce((sum, t) => sum + (t.amount_usd || 0), 0) || 0;

        const totalWithdrawn = transactions?.filter(t => t.transaction_type === 'withdrawal')
          .reduce((sum, t) => sum + (t.amount_usd || 0), 0) || 0;

        const currentValue = portfolio?.total_value_usd || 0;
        const netReturn = currentValue - totalInvested + totalWithdrawn;
        const roiPercent = totalInvested > 0 ? (netReturn / totalInvested) * 100 : 0;

        // Asset allocation
        const assetAllocation = holdings?.map(h => ({
          symbol: h.asset_symbol,
          name: h.asset_name,
          value: h.value_usd,
          percentage: portfolio ? (h.value_usd / portfolio.total_value_usd) * 100 : 0,
          amount: h.amount,
        })) || [];

        analytics = {
          type: 'portfolio',
          timeframe,
          portfolio: {
            total_value: currentValue,
            change_24h: portfolio?.change_24h || 0,
            change_24h_percent: portfolio?.change_24h_percent || 0,
          },
          performance: {
            total_invested: totalInvested,
            total_withdrawn: totalWithdrawn,
            net_return: netReturn,
            roi_percent: roiPercent.toFixed(2),
          },
          asset_allocation: assetAllocation,
          transactions_count: transactions?.length || 0,
        };
        break;

      case 'trading_performance':
        const tradingUserId = userId || user.id;

        const { data: trades } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', tradingUserId)
          .eq('transaction_type', 'trade')
          .gte('created_at', startDate);

        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', tradingUserId)
          .gte('created_at', startDate);

        const totalTradeValue = trades?.reduce((sum, t) => sum + (t.amount_usd || 0), 0) || 0;
        const totalFees = trades?.reduce((sum, t) => sum + (t.fee_usd || 0), 0) || 0;

        const filledOrders = orders?.filter(o => o.status === 'filled') || [];
        const winningOrders = filledOrders.filter(o => 
          o.order_side === 'sell' && o.filled_amount * o.price > o.amount * o.price
        );

        const winRate = filledOrders.length > 0 
          ? (winningOrders.length / filledOrders.length) * 100 
          : 0;

        analytics = {
          type: 'trading_performance',
          timeframe,
          total_trades: trades?.length || 0,
          total_trade_value: totalTradeValue,
          total_fees: totalFees,
          orders: {
            total: orders?.length || 0,
            filled: filledOrders.length,
            open: orders?.filter(o => o.status === 'open').length || 0,
            cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
          },
          performance: {
            win_rate: winRate.toFixed(2),
            winning_trades: winningOrders.length,
            losing_trades: filledOrders.length - winningOrders.length,
          },
        };
        break;

      case 'agent_performance':
        if (!agentId) {
          throw new Error('Agent ID required for agent performance analytics');
        }

        const { data: agent } = await supabase
          .from('agents')
          .select('*')
          .eq('id', agentId)
          .single();

        const { data: agentTrades } = await supabase
          .from('agent_trades')
          .select('*')
          .eq('agent_id', agentId)
          .gte('created_at', startDate);

        const { data: performance } = await supabase
          .from('agent_performance')
          .select('*')
          .eq('agent_id', agentId)
          .gte('recorded_at', startDate)
          .order('recorded_at', { ascending: true });

        const successfulTrades = agentTrades?.filter(t => t.status === 'executed' && t.profit_loss > 0) || [];
        const failedTrades = agentTrades?.filter(t => t.status === 'executed' && t.profit_loss < 0) || [];

        const totalProfit = agentTrades?.reduce((sum, t) => sum + (t.profit_loss || 0), 0) || 0;
        const avgProfit = (agentTrades && agentTrades.length > 0) ? totalProfit / agentTrades.length : 0;

        analytics = {
          type: 'agent_performance',
          timeframe,
          agent: {
            id: agentId,
            name: agent?.name,
            status: agent?.status,
            strategy: agent?.strategy,
          },
          trades: {
            total: agentTrades?.length || 0,
            successful: successfulTrades.length,
            failed: failedTrades.length,
            pending: agentTrades?.filter(t => t.status === 'pending').length || 0,
          },
          performance: {
            total_profit: totalProfit,
            avg_profit_per_trade: avgProfit,
            win_rate: (agentTrades && agentTrades.length > 0)
              ? ((successfulTrades.length / agentTrades.length) * 100).toFixed(2)
              : 0,
          },
          history: performance || [],
        };
        break;

      case 'system_health':
        // Check if admin
        const { data: isAdmin } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (!isAdmin) {
          throw new Error('Admin access required for system health analytics');
        }

        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id');

        const { data: activeAgents } = await supabase
          .from('agents')
          .select('id')
          .eq('status', 'active');

        const { data: recentTrades } = await supabase
          .from('transactions')
          .select('amount_usd, fee_usd')
          .gte('created_at', startDate);

        const { data: pools } = await supabase
          .from('pools')
          .select('*');

        const totalVolume = recentTrades?.reduce((sum, t) => sum + (t.amount_usd || 0), 0) || 0;
        const totalFeeRevenue = recentTrades?.reduce((sum, t) => sum + (t.fee_usd || 0), 0) || 0;

        const totalLiquidity = pools?.reduce((sum, p) => sum + p.total_liquidity_usd, 0) || 0;

        analytics = {
          type: 'system_health',
          timeframe,
          users: {
            total: allUsers?.length || 0,
          },
          agents: {
            total: activeAgents?.length || 0,
            active: activeAgents?.length || 0,
          },
          trading: {
            total_volume: totalVolume,
            total_trades: recentTrades?.length || 0,
            fee_revenue: totalFeeRevenue,
          },
          pools: {
            count: pools?.length || 0,
            total_liquidity: totalLiquidity,
          },
        };
        break;

      default:
        throw new Error('Invalid analytics type');
    }

    console.log('Analytics generated successfully');

    return new Response(
      JSON.stringify({
        ...analytics,
        generated_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analytics-engine:', error);
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