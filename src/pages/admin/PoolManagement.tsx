import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePoolManagement } from '@/hooks/usePoolManagement';
import { 
  Database, ArrowUpRight, ArrowDownRight, RefreshCw, 
  Droplets, TrendingUp, AlertTriangle, Zap
} from 'lucide-react';

interface Pool {
  id: string;
  name: string;
  pool_number: number;
  total_liquidity: number;
  total_liquidity_usd: number;
  reserve_ratio: number | null;
  description: string | null;
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
  const { rebalancePools, loading: poolLoading } = usePoolManagement();

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

  const handleRebalance = async () => {
    await rebalancePools();
    fetchPoolData();
  };

  const totalLiquidity = pools.reduce((sum, p) => sum + p.total_liquidity_usd, 0);
  const avgReserveRatio = pools.reduce((sum, p) => sum + (p.reserve_ratio || 0), 0) / (pools.length || 1);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Pool Management</h1>
            <p className="text-muted-foreground">Dual pool liquidity system for DEW tokens</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchPoolData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleRebalance} disabled={poolLoading}>
              <Zap className="h-4 w-4 mr-2" />
              Auto Rebalance
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Liquidity</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-primary">
                ${totalLiquidity.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-primary mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +5.2% from last week
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Reserve Ratio</CardTitle>
              <Droplets className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{(avgReserveRatio * 100).toFixed(1)}%</div>
              <Progress value={avgReserveRatio * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pool Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary text-primary">Healthy</Badge>
                <span className="text-sm text-muted-foreground">All pools operational</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pool Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {pools.map((pool) => {
            const reservePercent = (pool.reserve_ratio || 0) * 100;
            const isLowReserve = reservePercent < 20;
            
            return (
              <Card key={pool.id} className={`relative overflow-hidden ${isLowReserve ? 'border-warning/50' : 'border-border/50'}`}>
                {pool.pool_number === 1 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {pool.name}
                        <Badge variant="secondary">Pool {pool.pool_number}</Badge>
                      </CardTitle>
                      <CardDescription>{pool.description || 'Liquidity pool for token management'}</CardDescription>
                    </div>
                    {isLowReserve && (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground">Total Liquidity</div>
                      <div className="text-xl font-bold font-mono text-primary">
                        ${pool.total_liquidity_usd.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground">Reserve Ratio</div>
                      <div className={`text-xl font-bold font-mono ${isLowReserve ? 'text-warning' : ''}`}>
                        {reservePercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reserve Health</span>
                      <span className={isLowReserve ? 'text-warning' : 'text-primary'}>{reservePercent.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={reservePercent} 
                      className={`h-2 ${isLowReserve ? '[&>div]:bg-warning' : ''}`} 
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Add Liquidity
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Recent Pool Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pool transactions yet</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.transaction_type === 'deposit' ? 'bg-primary/20' : 'bg-destructive/20'
                      }`}>
                        {tx.transaction_type === 'deposit' ? (
                          <ArrowDownRight className="h-4 w-4 text-primary" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{tx.transaction_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">
                        {tx.amount.toLocaleString()} {tx.asset_symbol}
                      </div>
                      {tx.amount_usd && (
                        <div className="text-sm text-muted-foreground">
                          ${tx.amount_usd.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
