import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AnalyticsRequest {
  type: 'portfolio' | 'trading_performance' | 'agent_performance' | 'system_health';
  timeframe?: string;
  userId?: string;
  agentId?: string;
}

export function useAnalytics() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();

  const fetchAnalytics = async (request: AnalyticsRequest) => {
    setLoading(true);
    try {
      const { data: analyticsData, error } = await supabase.functions.invoke('analytics-engine', {
        body: request,
      });

      if (error) throw error;

      setData(analyticsData);
      return analyticsData;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
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
    data,
    fetchAnalytics,
  };
}