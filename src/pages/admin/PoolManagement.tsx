import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Pool {
  id: string;
  name: string;
  pool_number: number;
  total_liquidity: number;
  total_liquidity_usd: number;
  reserve_ratio: number | null;
}

interface PoolTransaction {
  id: string;
  transaction_type: string;
  asset_symbol: string;
  amount: number;
  amount_usd: number | null;
  created_at: string;
}

export default function PoolManagement() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [transactions, setTransactions] = useState<PoolTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPoolData();
    
    const channel = supabase
      .channel('pool-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pools' }, fetchPoolData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pool_transactions' }, fetchPoolData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPoolData = async () => {
    try {
      const [poolsRes, transactionsRes] = await Promise.all([
        supabase.from('pools').select('*').order('pool_number'),
        supabase
          .from('pool_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (poolsRes.data) setPools(poolsRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pool data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">Loading pool data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Pool Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pools.map((pool) => (
          <Card key={pool.id}>
            <CardHeader>
              <CardTitle>{pool.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Liquidity:</span>
                <span className="font-bold">${pool.total_liquidity_usd.toLocaleString()}</span>
              </div>
              {pool.reserve_ratio && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reserve Ratio:</span>
                  <span className="font-bold">{(pool.reserve_ratio * 100).toFixed(2)}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Pool Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center text-muted-foreground">No transactions yet</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{tx.transaction_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {tx.amount} {tx.asset_symbol}
                    </div>
                    {tx.amount_usd && (
                      <div className="text-sm text-muted-foreground">${tx.amount_usd.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
