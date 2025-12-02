import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface RealtimePrice {
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  timestamp: string;
}

export interface DexLiquidity {
  dex: string;
  pools: Array<{
    id: string;
    token0: { symbol: string };
    token1: { symbol: string };
    totalValueLockedUSD: string;
    volumeUSD: string;
  }>;
}

interface PriceUpdate {
  prices: RealtimePrice[];
  dex_liquidity: DexLiquidity[];
  timestamp: string;
}

export function useRealtimePrices() {
  const [prices, setPrices] = useState<RealtimePrice[]>([]);
  const [dexLiquidity, setDexLiquidity] = useState<DexLiquidity[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `wss://tktjjxgxvzzvgnmeodqg.supabase.co/functions/v1/realtime-prices`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setLoading(false);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'price_update') {
            const data: PriceUpdate = message.data;
            setPrices(data.prices);
            setDexLiquidity(data.dex_liquidity || []);
          } else if (message.type === 'dex_quote') {
            // Handle DEX quote response
            console.log('DEX Quote:', message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setLoading(false);
      
      // Fallback to HTTP polling
      fetchPricesHttp();
    }
  }, []);

  const fetchPricesHttp = async () => {
    try {
      const response = await fetch(
        `https://tktjjxgxvzzvgnmeodqg.supabase.co/functions/v1/realtime-prices`
      );
      
      if (response.ok) {
        const data = await response.json();
        setPrices(data.prices || []);
        setDexLiquidity(data.dex_liquidity || []);
      }
    } catch (error) {
      console.error('HTTP fallback error:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = useCallback((pairs: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', pairs }));
    }
  }, []);

  const getDexQuote = useCallback((dex: string, pair: string, amount: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'get_dex_quote', 
        dex, 
        pair, 
        amount 
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const getPriceBySymbol = useCallback((symbol: string): RealtimePrice | undefined => {
    return prices.find(p => p.symbol === symbol);
  }, [prices]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    prices,
    dexLiquidity,
    connected,
    loading,
    subscribe,
    getDexQuote,
    getPriceBySymbol,
    reconnect: connect,
  };
}
