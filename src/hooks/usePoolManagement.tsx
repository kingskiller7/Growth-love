import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pool {
  id: string;
  name: string;
  pool_number: number;
  total_liquidity: number;
  total_liquidity_usd: number;
  reserve_ratio: number;
  created_at: string;
  updated_at: string;
}

export interface PoolOperation {
  action: 'rebalance' | 'add_liquidity' | 'remove_liquidity' | 'convert_to_dew';
  poolId: string;
  assetSymbol?: string;
  amount?: number;
}

export function usePoolManagement() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const managePool = async (operation: PoolOperation) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pool-manager', {
        body: operation,
      });

      if (error) throw error;

      toast({
        title: 'Pool Operation Successful',
        description: data.message || 'Pool operation completed successfully',
      });

      return data;
    } catch (error) {
      console.error('Error managing pool:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to manage pool';
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
    managePool,
  };
}