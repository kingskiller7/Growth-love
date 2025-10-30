import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketPrice {
  symbol: string;
  price: number;
  change_24h: number;
  change_24h_percent: number;
  last_updated: string;
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

    // Fetch live prices from CoinGecko API
    const symbols = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot', 'dogecoin', 'ripple'];
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbols.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched market data:', data);

    // Transform data to our format
    const marketPrices: MarketPrice[] = Object.entries(data).map(([id, priceData]: [string, any]) => {
      const symbolMap: Record<string, string> = {
        bitcoin: 'BTC',
        ethereum: 'ETH',
        cardano: 'ADA',
        solana: 'SOL',
        polkadot: 'DOT',
        dogecoin: 'DOGE',
        ripple: 'XRP',
      };

      return {
        symbol: symbolMap[id] || id.toUpperCase(),
        price: priceData.usd,
        change_24h: priceData.usd * (priceData.usd_24h_change / 100),
        change_24h_percent: priceData.usd_24h_change,
        last_updated: new Date().toISOString(),
      };
    });

    // Store in database for real-time subscriptions
    for (const price of marketPrices) {
      const { error } = await supabase
        .from('market_prices')
        .upsert(
          {
            symbol: price.symbol,
            price: price.price,
            change_24h: price.change_24h,
            change_24h_percent: price.change_24h_percent,
            last_updated: price.last_updated,
          },
          { onConflict: 'symbol' }
        );

      if (error) {
        console.error(`Error updating ${price.symbol}:`, error);
      }
    }

    console.log('Market prices updated successfully');

    return new Response(
      JSON.stringify({ success: true, prices: marketPrices }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in market-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
