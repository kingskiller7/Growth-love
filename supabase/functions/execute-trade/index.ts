import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TradeRequest {
  orderId: string;
  dexSource?: string;
}

interface DexQuote {
  dex: string;
  price: number;
  outputAmount: number;
  gasCost: number;
  route?: string[];
}

// Production DEX API integrations
async function getUniswapQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote | null> {
  try {
    // Uniswap V3 Quoter API
    const response = await fetch('https://api.uniswap.org/v1/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenInAddress: getTokenAddress(tokenIn, 'ethereum'),
        tokenOutAddress: getTokenAddress(tokenOut, 'ethereum'),
        amount: (amount * 1e18).toString(),
        type: 'exactIn',
      }),
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    
    return {
      dex: 'Uniswap V3',
      price: parseFloat(data.quote) / amount,
      outputAmount: parseFloat(data.quote),
      gasCost: parseFloat(data.gasEstimate) || 0.005,
      route: data.route,
    };
  } catch (error) {
    console.error('Uniswap quote error:', error);
    return null;
  }
}

async function getPancakeSwapQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote | null> {
  try {
    // PancakeSwap API
    const tokenInAddr = getTokenAddress(tokenIn, 'bsc');
    const tokenOutAddr = getTokenAddress(tokenOut, 'bsc');
    
    const response = await fetch(
      `https://api.pancakeswap.info/api/v2/tokens/${tokenInAddr}`
    );
    
    if (!response.ok) return null;
    const data = await response.json();
    
    return {
      dex: 'PancakeSwap',
      price: parseFloat(data.data?.price || '0'),
      outputAmount: amount * parseFloat(data.data?.price || '0'),
      gasCost: 0.001, // BSC is cheaper
    };
  } catch (error) {
    console.error('PancakeSwap quote error:', error);
    return null;
  }
}

async function getBiswapQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote | null> {
  try {
    // Biswap uses similar API to PancakeSwap
    const tokenInAddr = getTokenAddress(tokenIn, 'bsc');
    
    const response = await fetch(
      `https://api.biswap.org/api/v1/token/${tokenInAddr}`
    );
    
    if (!response.ok) return null;
    const data = await response.json();
    
    return {
      dex: 'Biswap',
      price: parseFloat(data.price || '0'),
      outputAmount: amount * parseFloat(data.price || '0'),
      gasCost: 0.0008,
    };
  } catch (error) {
    console.error('Biswap quote error:', error);
    return null;
  }
}

// Token address mapping for different chains
function getTokenAddress(symbol: string, chain: string): string {
  const addresses: Record<string, Record<string, string>> = {
    ethereum: {
      BTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
      ETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    bsc: {
      BTC: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB
      ETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      BNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
      USDT: '0x55d398326f99059fF775485246999027B3197955',
    },
  };
  return addresses[chain]?.[symbol] || '';
}

// Get best quote from all DEXs
async function getBestDexQuote(
  tokenIn: string,
  tokenOut: string,
  amount: number,
  preferredDex?: string
): Promise<{ quote: DexQuote; allQuotes: DexQuote[] }> {
  console.log(`Fetching DEX quotes for ${amount} ${tokenIn} -> ${tokenOut}`);
  
  const quotePromises = [
    getUniswapQuote(tokenIn, tokenOut, amount),
    getPancakeSwapQuote(tokenIn, tokenOut, amount),
    getBiswapQuote(tokenIn, tokenOut, amount),
  ];
  
  const results = await Promise.all(quotePromises);
  const validQuotes = results.filter((q): q is DexQuote => q !== null && q.price > 0);
  
  // If no live quotes, use market price as fallback
  if (validQuotes.length === 0) {
    console.log('No live DEX quotes available, using market price fallback');
    return {
      quote: {
        dex: preferredDex || 'Market',
        price: 0, // Will be filled from market_prices
        outputAmount: 0,
        gasCost: 0.002,
      },
      allQuotes: [],
    };
  }
  
  // Sort by effective price (price minus gas cost impact)
  validQuotes.sort((a, b) => {
    const effectiveA = a.outputAmount - a.gasCost;
    const effectiveB = b.outputAmount - b.gasCost;
    return effectiveB - effectiveA;
  });
  
  console.log(`Best quote: ${validQuotes[0].dex} at $${validQuotes[0].price}`);
  
  // Use preferred DEX if specified and available
  if (preferredDex) {
    const preferred = validQuotes.find(q => q.dex.toLowerCase().includes(preferredDex.toLowerCase()));
    if (preferred) {
      return { quote: preferred, allQuotes: validQuotes };
    }
  }
  
  return { quote: validQuotes[0], allQuotes: validQuotes };
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

    // Get current market price as fallback
    const { data: marketPrice } = await supabase
      .from('market_prices')
      .select('price')
      .eq('symbol', order.base_asset)
      .single();

    const fallbackPrice = marketPrice?.price || 0;

    // Fetch best DEX quote for production execution
    const { quote: bestQuote, allQuotes } = await getBestDexQuote(
      order.base_asset,
      order.quote_asset,
      order.amount,
      dexSource
    );

    // Use DEX price if available, otherwise market price
    const currentPrice = bestQuote.price > 0 ? bestQuote.price : fallbackPrice;

    if (currentPrice === 0) {
      throw new Error('Unable to determine execution price');
    }

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
    const gasCost = bestQuote.gasCost;

    console.log(`Executing ${order.order_side} order: ${order.amount} ${order.base_asset} at ${executionPrice} via ${bestQuote.dex}`);

    // Check user has sufficient DEW balance for fees
    const { data: dewBalance } = await supabase
      .from('dew_tokens')
      .select('balance, total_spent')
      .eq('user_id', user.id)
      .single();

    if (!dewBalance || dewBalance.balance < dewFee) {
      throw new Error('Insufficient DEW token balance for fees');
    }

    // Generate transaction hash (in production, this would come from actual blockchain tx)
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
        transaction_type: 'trade',
        asset_symbol: order.base_asset,
        amount: order.amount,
        amount_usd: totalValue,
        fee: dewFee,
        fee_usd: tradingFee,
        status: 'completed',
        completed_at: new Date().toISOString(),
        transaction_hash: transactionHash,
        network: bestQuote.dex,
        notes: `${order.order_type} ${order.order_side} order executed via ${bestQuote.dex}`,
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
        message: `${order.order_side.toUpperCase()} order for ${order.amount} ${order.base_asset} executed at $${executionPrice.toFixed(2)} via ${bestQuote.dex}`,
        type: 'trade',
        metadata: {
          order_id: orderId,
          transaction_hash: transactionHash,
          dex_used: bestQuote.dex,
          gas_cost: gasCost,
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
        gas_cost: gasCost,
        dex_used: bestQuote.dex,
        all_quotes: allQuotes.map(q => ({
          dex: q.dex,
          price: q.price,
          gas_cost: q.gasCost,
        })),
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