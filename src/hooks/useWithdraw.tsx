import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useWithdraw() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createWithdrawal = async (
    assetSymbol: string,
    amount: number,
    toAddress: string,
    network: string,
    fee: number
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user has sufficient balance
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!portfolio) throw new Error('Portfolio not found');

      const { data: holding } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .eq('asset_symbol', assetSymbol)
        .single();

      if (!holding || holding.amount < amount) {
        throw new Error('Insufficient balance');
      }

      // Create withdrawal transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'withdrawal',
          asset_symbol: assetSymbol,
          amount,
          to_address: toAddress,
          network,
          status: 'pending',
          fee,
          fee_usd: fee * (holding.current_price || 0),
        })
        .select()
        .single();

      if (txError) throw txError;

      // Update holding balance
      const { error: updateError } = await supabase
        .from('holdings')
        .update({
          amount: holding.amount - amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', holding.id);

      if (updateError) throw updateError;

      toast({
        title: 'Withdrawal Initiated',
        description: `Your ${assetSymbol} withdrawal is being processed. Funds will be sent to the specified address shortly.`,
      });

      return { data: transaction, error: null };
    } catch (error: any) {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to create withdrawal',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const confirmWithdrawal = async (transactionId: string, transactionHash: string) => {
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
        title: 'Withdrawal Confirmed',
        description: 'Your withdrawal has been processed successfully.',
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

  return { createWithdrawal, confirmWithdrawal, loading };
}
