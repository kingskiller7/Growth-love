import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RiskCheck {
  type: 'circuit_breaker' | 'stop_loss' | 'position_size' | 'anomaly_detection';
  userId?: string;
  orderId?: string;
  data?: any;
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

    const { type, userId, orderId, data }: RiskCheck = await req.json();

    console.log(`Risk check: ${type}`);

    let result: any = { safe: true };

    switch (type) {
      case 'circuit_breaker':
        // Check for extreme market volatility
        const { data: recentPrices } = await supabase
          .from('market_prices')
          .select('symbol, change_24h_percent')
          .order('last_updated', { ascending: false })
          .limit(10);

        if (recentPrices) {
          const avgVolatility = recentPrices.reduce((sum, p) => 
            sum + Math.abs(p.change_24h_percent || 0), 0) / recentPrices.length;

          if (avgVolatility > 20) {
            result = {
              safe: false,
              triggered: true,
              reason: 'Extreme market volatility detected',
              volatility: avgVolatility,
              action: 'halt_trading',
            };

            // Create system alert
            await supabase
              .from('security_alerts')
              .insert({
                user_id: userId || '00000000-0000-0000-0000-000000000000',
                alert_type: 'circuit_breaker',
                alert_message: `Circuit breaker triggered: Market volatility at ${avgVolatility.toFixed(2)}%`,
                severity: 'high',
                metadata: { volatility: avgVolatility },
              });
          }
        }
        break;

      case 'stop_loss':
        if (!orderId) {
          throw new Error('Order ID required for stop loss check');
        }

        const { data: order } = await supabase
          .from('orders')
          .select('*, base_asset')
          .eq('id', orderId)
          .single();

        if (order && order.stop_price) {
          const { data: currentPrice } = await supabase
            .from('market_prices')
            .select('price')
            .eq('symbol', order.base_asset)
            .single();

          if (currentPrice && currentPrice.price <= order.stop_price) {
            result = {
              safe: false,
              triggered: true,
              reason: 'Stop loss price reached',
              current_price: currentPrice.price,
              stop_price: order.stop_price,
              action: 'execute_stop_loss',
            };

            // Auto-execute stop loss
            await supabase
              .from('orders')
              .update({ status: 'filled', filled_at: new Date().toISOString() })
              .eq('id', orderId);

            await supabase
              .from('notifications')
              .insert({
                user_id: order.user_id,
                title: 'Stop Loss Triggered',
                message: `Stop loss executed for ${order.base_asset} at $${currentPrice.price}`,
                type: 'trade',
                metadata: { order_id: orderId },
              });
          }
        }
        break;

      case 'position_size':
        if (!userId || !data?.amount || !data?.assetValue) {
          throw new Error('User ID, amount, and asset value required');
        }

        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('total_value_usd')
          .eq('user_id', userId)
          .single();

        if (portfolio) {
          const positionSize = (data.amount * data.assetValue) / portfolio.total_value_usd;
          const maxPositionSize = 0.2; // 20% max per position

          if (positionSize > maxPositionSize) {
            result = {
              safe: false,
              triggered: true,
              reason: 'Position size exceeds risk limit',
              position_size: positionSize,
              max_allowed: maxPositionSize,
              action: 'reduce_position',
            };

            await supabase
              .from('security_alerts')
              .insert({
                user_id: userId,
                alert_type: 'position_size',
                alert_message: `Position size ${(positionSize * 100).toFixed(1)}% exceeds ${(maxPositionSize * 100)}% limit`,
                severity: 'medium',
              });
          }
        }
        break;

      case 'anomaly_detection':
        if (!userId) {
          throw new Error('User ID required for anomaly detection');
        }

        // Check for unusual trading patterns
        const { data: recentTrades } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .eq('transaction_type', 'trade')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
          .order('created_at', { ascending: false });

        if (recentTrades && recentTrades.length > 50) {
          result = {
            safe: false,
            triggered: true,
            reason: 'Unusual high-frequency trading detected',
            trade_count: recentTrades.length,
            time_window: '1 hour',
            action: 'flag_for_review',
          };

          await supabase
            .from('security_alerts')
            .insert({
              user_id: userId,
              alert_type: 'anomaly_detected',
              alert_message: `Unusual activity: ${recentTrades.length} trades in last hour`,
              severity: 'high',
              metadata: { trade_count: recentTrades.length },
            });
        }
        break;

      default:
        throw new Error('Invalid risk check type');
    }

    console.log(`Risk check completed: ${JSON.stringify(result)}`);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in risk-manager:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, safe: true }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});