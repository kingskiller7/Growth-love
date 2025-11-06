import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDeposit() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createDeposit = async (assetSymbol: string, amount: number, network: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create deposit transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'deposit',
          asset_symbol: assetSymbol,
          amount,
          network,
          status: 'pending',
          fee: 0,
          fee_usd: 0,
        })
        .select()
        .single();

      if (txError) throw txError;

      toast({
        title: 'Deposit Initiated',
        description: `Your ${assetSymbol} deposit is being processed. It will appear in your wallet once confirmed on the blockchain.`,
      });

      return { data: transaction, error: null };
    } catch (error: any) {
      toast({
        title: 'Deposit Failed',
        description: error.message || 'Failed to create deposit',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const confirmDeposit = async (transactionId: string, transactionHash: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          transaction_hash: transactionHash,
          completed_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: 'Deposit Confirmed',
        description: 'Your deposit has been confirmed and added to your balance.',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Confirmation Failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  return { createDeposit, confirmDeposit, loading };
}
