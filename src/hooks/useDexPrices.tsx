import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DexQuote {
  dex: string;
  price: number;
  liquidity: number;
  estimatedGas: number;
  gasCostUSD: number;
  totalCost: number;
  totalCostPerToken: number;
}

export interface DexPricesResponse {
  baseAsset: string;
  quoteAsset: string;
  amount: number;
  quotes: DexQuote[];
  bestQuote: {
    dex: string;
    price: number;
    totalCost: number;
    gasCost: number;
  };
  timestamp: string;
}

export function useDexPrices() {
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<DexPricesResponse | null>(null);
  const { toast } = useToast();

  const fetchDexPrices = async (
    baseAsset: string,
    quoteAsset: string = 'USDT',
    amount: number = 1
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dex-prices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: new URLSearchParams({
          baseAsset,
          quoteAsset,
          amount: amount.toString(),
        }),
      });

      if (error) throw error;

      setPrices(data);
      return data as DexPricesResponse;
    } catch (error) {
      console.error('Error fetching DEX prices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch DEX prices';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    prices,
    loading,
    fetchDexPrices,
  };
}
