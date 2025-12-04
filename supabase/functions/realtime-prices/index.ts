import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Live DEX API endpoints
const DEX_APIS = {
  uniswap: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  pancakeswap: "https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc",
  biswap: "https://api.thegraph.com/subgraphs/name/biswap-org/exchange5",
  sushiswap: "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
};

// Token addresses for major pairs
const TOKEN_ADDRESSES = {
  ETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  BNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
};

serve(async (req) => {
  // Handle WebSocket upgrade
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    // Non-WebSocket request - return HTTP prices
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Fetch live prices from multiple DEXs
      const prices = await fetchLiveDexPrices();
      
      return new Response(JSON.stringify(prices), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching prices:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch prices" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // WebSocket connection
  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let priceInterval: number;
  
  socket.onopen = () => {
    console.log("WebSocket client connected");
    
    // Send initial prices
    sendPrices(socket);
    
    // Set up interval to send price updates every 5 seconds
    priceInterval = setInterval(() => {
      sendPrices(socket);
    }, 5000);
  };
  
  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === "subscribe") {
        // Handle subscription to specific pairs
        console.log("Subscription request:", message.pairs);
      } else if (message.type === "get_dex_quote") {
        // Get quote from specific DEX
        const quote = await getDexQuote(message.dex, message.pair, message.amount);
        socket.send(JSON.stringify({ type: "dex_quote", data: quote }));
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  };
  
  socket.onclose = () => {
    console.log("WebSocket client disconnected");
    if (priceInterval) {
      clearInterval(priceInterval);
    }
  };

  return response;
});

async function fetchLiveDexPrices() {
  const symbols = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "AVAX", "DOT", "MATIC"];
  
  try {
    // Fetch from CoinGecko for comprehensive data
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,avalanche-2,polkadot,matic-network&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    
    if (!response.ok) {
      throw new Error("CoinGecko API error");
    }
    
    const data = await response.json();
    
    const coinMap: { [key: string]: string } = {
      bitcoin: "BTC",
      ethereum: "ETH",
      binancecoin: "BNB",
      solana: "SOL",
      ripple: "XRP",
      cardano: "ADA",
      dogecoin: "DOGE",
      "avalanche-2": "AVAX",
      polkadot: "DOT",
      "matic-network": "MATIC",
    };

    const prices = Object.entries(data).map(([coinId, info]: [string, any]) => ({
      symbol: coinMap[coinId],
      price: info.usd,
      change_24h: info.usd_24h_change || 0,
      volume_24h: info.usd_24h_vol || 0,
      market_cap: info.usd_market_cap || 0,
      timestamp: new Date().toISOString(),
    }));

    // Also fetch DEX-specific liquidity data from multiple DEXs
    const dexData = await Promise.allSettled([
      fetchUniswapData(),
      fetchPancakeSwapData(),
      fetchBiswapData(),
    ]);

    return {
      prices,
      dex_liquidity: dexData
        .filter((r) => r.status === "fulfilled")
        .map((r: any) => r.value),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Price fetch error:", error);
    throw error;
  }
}

async function fetchUniswapData() {
  const query = `
    query {
      pools(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        token0 { symbol }
        token1 { symbol }
        totalValueLockedUSD
        volumeUSD
      }
    }
  `;

  try {
    const response = await fetch(DEX_APIS.uniswap, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return {
      dex: "Uniswap",
      chain: "Ethereum",
      pools: data.data?.pools || [],
    };
  } catch {
    return { dex: "Uniswap", chain: "Ethereum", pools: [], error: "Failed to fetch" };
  }
}

async function fetchPancakeSwapData() {
  const query = `
    query {
      pools(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        token0 { symbol }
        token1 { symbol }
        totalValueLockedUSD
        volumeUSD
      }
    }
  `;

  try {
    const response = await fetch(DEX_APIS.pancakeswap, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return {
      dex: "PancakeSwap",
      chain: "BSC",
      pools: data.data?.pools || [],
    };
  } catch {
    return { dex: "PancakeSwap", chain: "BSC", pools: [], error: "Failed to fetch" };
  }
}

async function fetchBiswapData() {
  const query = `
    query {
      pairs(first: 10, orderBy: reserveUSD, orderDirection: desc) {
        id
        token0 { symbol }
        token1 { symbol }
        reserveUSD
        volumeUSD
      }
    }
  `;

  try {
    const response = await fetch(DEX_APIS.biswap, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return {
      dex: "Biswap",
      chain: "BSC",
      pools: (data.data?.pairs || []).map((p: any) => ({
        id: p.id,
        token0: p.token0,
        token1: p.token1,
        totalValueLockedUSD: p.reserveUSD,
        volumeUSD: p.volumeUSD,
      })),
    };
  } catch {
    return { dex: "Biswap", chain: "BSC", pools: [], error: "Failed to fetch" };
  }
}

async function getDexQuote(dex: string, pair: string, amount: number) {
  // Simulate DEX quote with realistic pricing based on DEX
  const dexFees: { [key: string]: number } = {
    Uniswap: 0.3,
    PancakeSwap: 0.25,
    Biswap: 0.1,
    SushiSwap: 0.3,
  };
  
  const basePrice = Math.random() * 1000 + 100;
  const slippage = amount > 10000 ? 0.5 : 0.1;
  const fee = dexFees[dex] || 0.3;
  
  return {
    dex,
    pair,
    amount,
    price: basePrice,
    fee,
    slippage,
    estimatedOutput: amount / basePrice * (1 - (slippage + fee) / 100),
    gas: dex === 'Uniswap' ? Math.floor(Math.random() * 50000) + 100000 : Math.floor(Math.random() * 30000) + 50000,
    timestamp: new Date().toISOString(),
  };
}

async function sendPrices(socket: WebSocket) {
  try {
    const prices = await fetchLiveDexPrices();
    socket.send(JSON.stringify({ type: "price_update", data: prices }));
  } catch (error) {
    console.error("Error sending prices:", error);
  }
}
