import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceQuote {
  dex: string;
  price: number;
  liquidity: number;
  estimatedGas: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const baseAsset = url.searchParams.get('baseAsset');
    const quoteAsset = url.searchParams.get('quoteAsset') || 'USDT';
    const amount = parseFloat(url.searchParams.get('amount') || '1');

    if (!baseAsset) {
      throw new Error('Base asset is required');
    }

    console.log(`Fetching DEX prices for ${baseAsset}/${quoteAsset}, amount: ${amount}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
    );

    // Get current market price from our database
    const { data: marketPrice } = await supabase
      .from('market_prices')
      .select('price')
      .eq('symbol', baseAsset)
      .single();

    const basePrice = marketPrice?.price || 100;

    // Simulate DEX price discovery (In production, integrate with real DEX APIs)
    // Uniswap V3, SushiSwap, PancakeSwap, etc.
    const dexQuotes: PriceQuote[] = [
      {
        dex: 'Uniswap V3',
        price: basePrice * (1 + (Math.random() * 0.01 - 0.005)), // ±0.5% variance
        liquidity: Math.random() * 1000000 + 500000,
        estimatedGas: Math.random() * 50000 + 150000,
      },
      {
        dex: 'SushiSwap',
        price: basePrice * (1 + (Math.random() * 0.015 - 0.0075)), // ±0.75% variance
        liquidity: Math.random() * 800000 + 400000,
        estimatedGas: Math.random() * 40000 + 140000,
      },
      {
        dex: 'PancakeSwap',
        price: basePrice * (1 + (Math.random() * 0.012 - 0.006)), // ±0.6% variance
        liquidity: Math.random() * 900000 + 450000,
        estimatedGas: Math.random() * 45000 + 130000,
      },
      {
        dex: '1inch',
        price: basePrice * (1 + (Math.random() * 0.008 - 0.004)), // ±0.4% variance (aggregator)
        liquidity: Math.random() * 1200000 + 600000,
        estimatedGas: Math.random() * 60000 + 180000,
      },
    ];

    // Sort by best price (lowest for buy, highest for sell)
    const sortedQuotes = dexQuotes.sort((a, b) => a.price - b.price);

    // Calculate total cost including gas for each DEX
    const quotesWithCost = sortedQuotes.map(quote => {
      const gasPrice = 20; // gwei
      const ethPrice = 2000; // USD
      const gasCostUSD = (quote.estimatedGas * gasPrice * ethPrice) / 1e9;
      const totalCost = (quote.price * amount) + gasCostUSD;

      return {
        ...quote,
        gasCostUSD,
        totalCost,
        totalCostPerToken: totalCost / amount,
      };
    });

    // Find best overall price
    const bestQuote = quotesWithCost.reduce((best, current) => 
      current.totalCost < best.totalCost ? current : best
    );

    console.log(`Best price found on ${bestQuote.dex}: $${bestQuote.price.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        success: true,
        baseAsset,
        quoteAsset,
        amount,
        quotes: quotesWithCost,
        bestQuote: {
          dex: bestQuote.dex,
          price: bestQuote.price,
          totalCost: bestQuote.totalCost,
          gasCost: bestQuote.gasCostUSD,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching DEX prices:', error);
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
