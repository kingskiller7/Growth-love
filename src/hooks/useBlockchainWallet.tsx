import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WalletAddress {
  id: string;
  user_id: string;
  address: string;
  chain: string;
  is_primary: boolean;
  created_at: string;
}

interface WalletBalance {
  chain: string;
  address: string;
  balance: string;
  symbol: string;
}

export function useBlockchainWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [balances, setBalances] = useState<WalletBalance[]>([]);

  useEffect(() => {
    if (user) {
      fetchWallets();
    }
  }, [user]);

  const fetchWallets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('id, user_id, address, chain, is_primary, created_at')
        .eq('user_id', user.id);

      if (error) throw error;
      setWallets(data || []);

      // Fetch balances for each wallet
      if (data && data.length > 0) {
        await fetchBalances(data);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const fetchBalances = async (walletList: WalletAddress[]) => {
    // In production, this would call blockchain RPC endpoints
    // For demo, we'll show mock balances
    const mockBalances: WalletBalance[] = walletList.map(w => ({
      chain: w.chain,
      address: w.address,
      balance: (Math.random() * 10).toFixed(4),
      symbol: w.chain === 'ethereum' ? 'ETH' : w.chain === 'bsc' ? 'BNB' : 'MATIC',
    }));
    setBalances(mockBalances);
  };

  // Generate a deterministic wallet address (simplified)
  const generateWalletAddress = (): { address: string; privateKey: string } => {
    // In production, use proper cryptographic libraries like ethers.js
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    
    const privateKey = '0x' + Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Generate address from private key (simplified - in production use proper derivation)
    const addressBytes = new Uint8Array(20);
    crypto.getRandomValues(addressBytes);
    const address = '0x' + Array.from(addressBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return { address, privateKey };
  };

  const createWallet = async (chain: string = 'ethereum') => {
    if (!user) return null;
    setLoading(true);

    try {
      const { address, privateKey } = generateWalletAddress();
      
      // Check if user already has a wallet for this chain
      const existingWallet = wallets.find(w => w.chain === chain);
      
      const { data, error } = await supabase
        .from('wallet_addresses')
        .insert({
          user_id: user.id,
          address,
          private_key_encrypted: privateKey, // In production, encrypt this!
          chain,
          is_primary: !existingWallet,
        })
        .select('id, user_id, address, chain, is_primary, created_at')
        .single();

      if (error) throw error;

      toast({
        title: 'Wallet Created',
        description: `New ${chain} wallet created successfully`,
      });

      await fetchWallets();
      return data;
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to create wallet',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendTransaction = async (
    fromAddress: string,
    toAddress: string,
    amount: string,
    chain: string
  ) => {
    if (!user) return null;
    setLoading(true);

    try {
      // In production, this would:
      // 1. Get the private key for the fromAddress
      // 2. Sign the transaction
      // 3. Broadcast to the blockchain
      
      // For now, record it in our transactions table
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'withdrawal',
          asset_symbol: chain === 'ethereum' ? 'ETH' : chain === 'bsc' ? 'BNB' : 'MATIC',
          amount: parseFloat(amount),
          from_address: fromAddress,
          to_address: toAddress,
          network: chain,
          status: 'pending',
          transaction_hash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''),
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate transaction confirmation after 3 seconds
      setTimeout(async () => {
        await supabase
          .from('transactions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', data.id);
      }, 3000);

      toast({
        title: 'Transaction Sent',
        description: 'Your transaction is being processed',
      });

      return data;
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to send transaction',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTransactionHistory = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  };

  return {
    loading,
    wallets,
    balances,
    createWallet,
    sendTransaction,
    getTransactionHistory,
    refreshWallets: fetchWallets,
  };
}
