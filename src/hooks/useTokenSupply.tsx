import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Pool {
  id: string;
  name: string;
  pool_number: number;
  current_supply: number;
  max_supply: number;
  circulating_supply: number;
  total_liquidity: number;
  total_liquidity_usd: number;
}

interface SupplyAction {
  id: string;
  action: string;
  amount: number;
  reason: string | null;
  pool_id: string | null;
  executed_by: string;
  created_at: string;
}

export function useTokenSupply() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [supplyHistory, setSupplyHistory] = useState<SupplyAction[]>([]);

  useEffect(() => {
    fetchPools();
    fetchSupplyHistory();
  }, []);

  const fetchPools = async () => {
    try {
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .order('pool_number');

      if (error) throw error;
      setPools(data || []);
    } catch (error) {
      console.error('Error fetching pools:', error);
    }
  };

  const fetchSupplyHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('token_supply_control')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSupplyHistory(data || []);
    } catch (error) {
      console.error('Error fetching supply history:', error);
    }
  };

  const mintTokens = async (poolId: string, amount: number, reason: string) => {
    setLoading(true);
    try {
      const pool = pools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');

      const newSupply = (pool.current_supply || 0) + amount;
      if (newSupply > (pool.max_supply || 1000000000)) {
        throw new Error('Cannot exceed maximum supply');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Record the mint action
      const { error: logError } = await supabase
        .from('token_supply_control')
        .insert({
          action: 'mint',
          amount,
          reason,
          pool_id: poolId,
          executed_by: user.id,
        });

      if (logError) throw logError;

      // Update pool supply
      const { error: updateError } = await supabase
        .from('pools')
        .update({
          current_supply: newSupply,
          circulating_supply: (pool.circulating_supply || 0) + amount,
          total_liquidity: (pool.total_liquidity || 0) + amount,
        })
        .eq('id', poolId);

      if (updateError) throw updateError;

      toast({
        title: 'Tokens Minted',
        description: `Successfully minted ${amount.toLocaleString()} DEW tokens`,
      });

      await fetchPools();
      await fetchSupplyHistory();
      return true;
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mint tokens',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const burnTokens = async (poolId: string, amount: number, reason: string) => {
    setLoading(true);
    try {
      const pool = pools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');

      if (amount > (pool.current_supply || 0)) {
        throw new Error('Cannot burn more than current supply');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Record the burn action
      const { error: logError } = await supabase
        .from('token_supply_control')
        .insert({
          action: 'burn',
          amount,
          reason,
          pool_id: poolId,
          executed_by: user.id,
        });

      if (logError) throw logError;

      // Update pool supply
      const { error: updateError } = await supabase
        .from('pools')
        .update({
          current_supply: (pool.current_supply || 0) - amount,
          circulating_supply: Math.max(0, (pool.circulating_supply || 0) - amount),
          total_liquidity: Math.max(0, (pool.total_liquidity || 0) - amount),
        })
        .eq('id', poolId);

      if (updateError) throw updateError;

      toast({
        title: 'Tokens Burned',
        description: `Successfully burned ${amount.toLocaleString()} DEW tokens`,
      });

      await fetchPools();
      await fetchSupplyHistory();
      return true;
    } catch (error) {
      console.error('Error burning tokens:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to burn tokens',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMaxSupply = async (poolId: string, newMaxSupply: number) => {
    setLoading(true);
    try {
      const pool = pools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');

      if (newMaxSupply < (pool.current_supply || 0)) {
        throw new Error('Max supply cannot be less than current supply');
      }

      const { error } = await supabase
        .from('pools')
        .update({ max_supply: newMaxSupply })
        .eq('id', poolId);

      if (error) throw error;

      toast({
        title: 'Max Supply Updated',
        description: `Maximum supply set to ${newMaxSupply.toLocaleString()} DEW`,
      });

      await fetchPools();
      return true;
    } catch (error) {
      console.error('Error updating max supply:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update max supply',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    pools,
    supplyHistory,
    mintTokens,
    burnTokens,
    updateMaxSupply,
    refreshData: () => {
      fetchPools();
      fetchSupplyHistory();
    },
  };
}
