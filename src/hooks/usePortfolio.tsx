import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Portfolio {
  id: string;
  total_value_usd: number;
  total_value: number;
  change_24h: number;
  change_24h_percent: number;
}

export interface Holding {
  id: string;
  asset_symbol: string;
  asset_name: string;
  amount: number;
  current_price: number | null;
  value_usd: number | null;
  change_24h: number | null;
  change_24h_percent: number | null;
  average_buy_price: number | null;
}

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPortfolioData();

    const channel = supabase
      .channel('portfolio-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolios' }, fetchPortfolioData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'holdings' }, fetchPortfolioData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [portfolioRes, holdingsRes] = await Promise.all([
        supabase.from('portfolios').select('*').eq('user_id', user.id).single(),
        supabase
          .from('holdings')
          .select('*')
          .eq('portfolio_id', (await supabase.from('portfolios').select('id').eq('user_id', user.id).single()).data?.id || ''),
      ]);

      if (portfolioRes.data) setPortfolio(portfolioRes.data);
      if (holdingsRes.data) setHoldings(holdingsRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolio data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { portfolio, holdings, loading, refetch: fetchPortfolioData };
}
