import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PoolOperation {
  action: 'rebalance' | 'add_liquidity' | 'remove_liquidity' | 'convert_to_dew';
  poolId: string;
  assetSymbol?: string;
  amount?: number;
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

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    const { action, poolId, assetSymbol, amount }: PoolOperation = await req.json();

    console.log(`Pool operation: ${action} for pool ${poolId} by admin ${user.id}`);

    // Get pool details
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('id', poolId)
      .single();

    if (poolError || !pool) {
      throw new Error('Pool not found');
    }

    let result: any = {};

    switch (action) {
      case 'rebalance':
        // Automatic rebalancing logic
        const targetRatio = pool.reserve_ratio || 0.2;
        const currentRatio = pool.total_liquidity > 0 
          ? pool.total_liquidity_usd / pool.total_liquidity 
          : 0;

        if (Math.abs(currentRatio - targetRatio) > 0.05) {
          // Rebalancing needed
          const rebalanceAmount = (targetRatio - currentRatio) * pool.total_liquidity;
          
          await supabase
            .from('pools')
            .update({
              total_liquidity: pool.total_liquidity + rebalanceAmount,
              total_liquidity_usd: pool.total_liquidity_usd + (rebalanceAmount * 1.2),
              reserve_ratio: targetRatio,
              updated_at: new Date().toISOString(),
            })
            .eq('id', poolId);

          await supabase
            .from('pool_transactions')
            .insert({
              pool_id: poolId,
              transaction_type: 'rebalance',
              asset_symbol: 'MULTI',
              amount: Math.abs(rebalanceAmount),
              amount_usd: Math.abs(rebalanceAmount * 1.2),
            });

          result = {
            message: 'Pool rebalanced successfully',
            old_ratio: currentRatio,
            new_ratio: targetRatio,
            rebalance_amount: rebalanceAmount,
          };
        } else {
          result = { message: 'Pool is already balanced', ratio: currentRatio };
        }
        break;

      case 'add_liquidity':
        if (!assetSymbol || !amount) {
          throw new Error('Asset symbol and amount required');
        }

        // Get market price
        const { data: price } = await supabase
          .from('market_prices')
          .select('price')
          .eq('symbol', assetSymbol)
          .single();

        const amountUsd = (price?.price || 1) * amount;

        await supabase
          .from('pools')
          .update({
            total_liquidity: pool.total_liquidity + amount,
            total_liquidity_usd: pool.total_liquidity_usd + amountUsd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', poolId);

        await supabase
          .from('pool_transactions')
          .insert({
            pool_id: poolId,
            transaction_type: 'add_liquidity',
            asset_symbol: assetSymbol,
            amount,
            amount_usd: amountUsd,
          });

        result = {
          message: 'Liquidity added successfully',
          amount,
          asset: assetSymbol,
          value_usd: amountUsd,
        };
        break;

      case 'remove_liquidity':
        if (!assetSymbol || !amount) {
          throw new Error('Asset symbol and amount required');
        }

        if (amount > pool.total_liquidity) {
          throw new Error('Insufficient liquidity in pool');
        }

        const { data: priceData } = await supabase
          .from('market_prices')
          .select('price')
          .eq('symbol', assetSymbol)
          .single();

        const removeAmountUsd = (priceData?.price || 1) * amount;

        await supabase
          .from('pools')
          .update({
            total_liquidity: pool.total_liquidity - amount,
            total_liquidity_usd: pool.total_liquidity_usd - removeAmountUsd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', poolId);

        await supabase
          .from('pool_transactions')
          .insert({
            pool_id: poolId,
            transaction_type: 'remove_liquidity',
            asset_symbol: assetSymbol,
            amount,
            amount_usd: removeAmountUsd,
          });

        result = {
          message: 'Liquidity removed successfully',
          amount,
          asset: assetSymbol,
          value_usd: removeAmountUsd,
        };
        break;

      case 'convert_to_dew':
        if (!amount) {
          throw new Error('Amount required');
        }

        // DEW conversion rate: 1 USD = 10 DEW tokens
        const dewAmount = amount * 10;

        // Record conversion in Pool 1 (DEW pool)
        const { data: dewPool } = await supabase
          .from('pools')
          .select('id')
          .eq('pool_number', 1)
          .single();

        if (dewPool) {
          await supabase
            .from('pool_transactions')
            .insert({
              pool_id: dewPool.id,
              transaction_type: 'conversion',
              asset_symbol: 'DEW',
              amount: dewAmount,
              amount_usd: amount,
            });
        }

        result = {
          message: 'USD converted to DEW tokens',
          usd_amount: amount,
          dew_amount: dewAmount,
          conversion_rate: 10,
        };
        break;

      default:
        throw new Error('Invalid pool operation');
    }

    console.log(`Pool operation completed: ${JSON.stringify(result)}`);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        pool: {
          id: poolId,
          name: pool.name,
          total_liquidity: pool.total_liquidity,
          total_liquidity_usd: pool.total_liquidity_usd,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in pool-manager:', error);
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