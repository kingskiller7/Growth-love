import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TradeRequest {
  orderId: string;
  dexSource?: string;
}

Deno.serve(async (req) => {
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

    const { orderId, dexSource }: TradeRequest = await req.json();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log(`Executing trade for order ${orderId} by user ${user.id}`);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'open') {
      throw new Error('Order is not open for execution');
    }

    // Get current market price
    const { data: marketPrice } = await supabase
      .from('market_prices')
      .select('price')
      .eq('symbol', order.base_asset)
      .single();

    const currentPrice = marketPrice?.price || 0;

    // Validate order can be executed
    if (order.order_type === 'limit') {
      if (order.order_side === 'buy' && currentPrice > order.price) {
        throw new Error('Market price above limit buy price');
      }
      if (order.order_side === 'sell' && currentPrice < order.price) {
        throw new Error('Market price below limit sell price');
      }
    }

    if (order.order_type === 'stop') {
      if (order.order_side === 'sell' && currentPrice > order.stop_price) {
        throw new Error('Stop loss not triggered');
      }
    }

    // Calculate execution details
    const executionPrice = order.order_type === 'market' ? currentPrice : order.price;
    const totalValue = order.amount * executionPrice;
    const tradingFee = totalValue * 0.001; // 0.1% fee
    const dewFee = tradingFee * 1.5; // DEW token fee (1.5x trading fee)

    console.log(`Executing ${order.order_side} order: ${order.amount} ${order.base_asset} at ${executionPrice}`);

    // Check user has sufficient DEW balance for fees
    const { data: dewBalance } = await supabase
      .from('dew_tokens')
      .select('balance, total_spent')
      .eq('user_id', user.id)
      .single();

    if (!dewBalance || dewBalance.balance < dewFee) {
      throw new Error('Insufficient DEW token balance for fees');
    }

    // Simulate DEX execution (In production, integrate with actual DEX APIs)
    const dexUsed = dexSource || 'uniswap';
    const transactionHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    // Update order status
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status: 'filled',
        filled_amount: order.amount,
        filled_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateOrderError) {
      console.error('Error updating order:', updateOrderError);
      throw new Error('Failed to update order status');
    }

    // Deduct DEW tokens for fee
    const { error: dewError } = await supabase
      .from('dew_tokens')
      .update({
        balance: dewBalance.balance - dewFee,
        total_spent: (dewBalance.total_spent || 0) + dewFee,
      })
      .eq('user_id', user.id);

    if (dewError) {
      console.error('Error updating DEW balance:', dewError);
    }

    // Create transaction record
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: order.order_side === 'buy' ? 'buy' : 'sell',
        asset_symbol: order.base_asset,
        amount: order.amount,
        amount_usd: totalValue,
        fee: dewFee,
        fee_usd: tradingFee,
        status: 'completed',
        completed_at: new Date().toISOString(),
        transaction_hash: transactionHash,
        network: dexUsed,
        notes: `${order.order_type} ${order.order_side} order executed`,
      });

    if (txError) {
      console.error('Error creating transaction:', txError);
    }

    // Update portfolio holdings
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (portfolio) {
      const { data: holding } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .eq('asset_symbol', order.base_asset)
        .single();

      if (holding) {
        const newAmount = order.order_side === 'buy' 
          ? holding.amount + order.amount 
          : holding.amount - order.amount;

        await supabase
          .from('holdings')
          .update({
            amount: newAmount,
            value_usd: newAmount * currentPrice,
            current_price: currentPrice,
          })
          .eq('id', holding.id);
      } else if (order.order_side === 'buy') {
        await supabase
          .from('holdings')
          .insert({
            portfolio_id: portfolio.id,
            asset_symbol: order.base_asset,
            asset_name: order.base_asset,
            amount: order.amount,
            current_price: executionPrice,
            value_usd: totalValue,
            average_buy_price: executionPrice,
          });
      }
    }

    // Send notification
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Trade Executed',
        message: `${order.order_side.toUpperCase()} order for ${order.amount} ${order.base_asset} executed at $${executionPrice.toFixed(2)}`,
        type: 'trade',
        metadata: {
          order_id: orderId,
          transaction_hash: transactionHash,
        },
      });

    console.log(`Trade executed successfully: ${transactionHash}`);

    return new Response(
      JSON.stringify({
        success: true,
        transaction_hash: transactionHash,
        execution_price: executionPrice,
        total_value: totalValue,
        fee: dewFee,
        dex_used: dexUsed,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error executing trade:', error);
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
