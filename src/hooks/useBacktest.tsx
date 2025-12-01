import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BacktestRequest {
  algorithmId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  tradingPairs?: string[];
}

export interface BacktestResult {
  algorithm_id: string;
  algorithm_name: string;
  period: {
    start: string;
    end: string;
    days: number;
  };
  initial_capital: number;
  final_capital: number;
  total_return: number;
  roi_percent: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: string;
  avg_profit_per_trade: string;
  max_drawdown: string;
  sharpe_ratio: string;
  sample_trades: any[];
}

export function useBacktest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BacktestResult | null>(null);
  const { toast } = useToast();

  const runBacktest = async (request: BacktestRequest) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('backtest-engine', {
        body: request,
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: 'Backtest Completed',
        description: `ROI: ${data.roi_percent}%, Win Rate: ${data.win_rate}%`,
      });

      return data;
    } catch (error) {
      console.error('Error running backtest:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to run backtest';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    results,
    runBacktest,
  };
}