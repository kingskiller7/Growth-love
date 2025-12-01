import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StrategistRequest {
  action: 'review_algorithm' | 'optimize_strategy' | 'generate_strategy';
  algorithmId?: string;
  marketConditions?: any;
}

export function useTradingStrategist() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const executeStrategist = async (request: StrategistRequest) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('trading-strategist', {
        body: request,
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: 'Trading Strategist',
        description: `${request.action} completed successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error executing strategist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute strategist';
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
    result,
    executeStrategist,
  };
}