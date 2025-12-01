import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RiskCheckRequest {
  type: 'circuit_breaker' | 'stop_loss' | 'position_size' | 'anomaly_detection';
  userId?: string;
  orderId?: string;
  data?: any;
}

export interface RiskCheckResult {
  safe: boolean;
  triggered?: boolean;
  reason?: string;
  action?: string;
  [key: string]: any;
}

export function useRiskManagement() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkRisk = async (request: RiskCheckRequest): Promise<RiskCheckResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('risk-manager', {
        body: request,
      });

      if (error) throw error;

      if (!data.safe && data.triggered) {
        toast({
          title: 'Risk Alert',
          description: data.reason,
          variant: 'destructive',
        });
      }

      return data;
    } catch (error) {
      console.error('Error checking risk:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check risk';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { safe: true }; // Fail safe
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkRisk,
  };
}