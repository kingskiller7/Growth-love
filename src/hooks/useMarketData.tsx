import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketPrice {
  id: string;
  symbol: string;
  price: number;
  change_24h: number | null;
  change_24h_percent: number | null;
  volume_24h: number | null;
  market_cap: number | null;
  last_updated: string;
}

export function useMarketData() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMarketData();

    // Set up real-time subscription
    const channel = supabase
      .channel('market-prices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_prices',
        },
        (payload) => {
          console.log('Market price update:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setPrices((current) => {
              const index = current.findIndex((p) => p.symbol === payload.new.symbol);
              if (index >= 0) {
                const updated = [...current];
                updated[index] = payload.new as MarketPrice;
                return updated;
              }
              return [...current, payload.new as MarketPrice];
            });
          }
        }
      )
      .subscribe();

    // Trigger market data update every 30 seconds
    const interval = setInterval(() => {
      triggerMarketDataUpdate();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('symbol', { ascending: true });

      if (error) throw error;
      if (data) {
        setPrices(data);
        if (data.length === 0) {
          // If no data, trigger initial fetch
          await triggerMarketDataUpdate();
        }
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch market data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerMarketDataUpdate = async () => {
    try {
      const { error } = await supabase.functions.invoke('market-data');
      if (error) throw error;
    } catch (error) {
      console.error('Error triggering market data update:', error);
    }
  };

  const getPriceBySymbol = (symbol: string): MarketPrice | undefined => {
    return prices.find((p) => p.symbol === symbol);
  };

  return {
    prices,
    loading,
    refetch: fetchMarketData,
    getPriceBySymbol,
    triggerUpdate: triggerMarketDataUpdate,
  };
}
