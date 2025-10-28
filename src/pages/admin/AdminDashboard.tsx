import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Activity, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    totalTransactions: 0,
    poolLiquidity: 0,
    systemAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, transactionsRes, poolsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('pools').select('total_liquidity_usd'),
      ]);

      const totalLiquidity = poolsRes.data?.reduce((sum, pool) => sum + Number(pool.total_liquidity_usd), 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        activeSessions: 0,
        totalTransactions: transactionsRes.count || 0,
        poolLiquidity: totalLiquidity,
        systemAlerts: 0,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch admin statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { title: 'Active Sessions', value: stats.activeSessions, icon: Activity, color: 'text-accent' },
    { title: 'Total Transactions', value: stats.totalTransactions, icon: TrendingUp, color: 'text-accent' },
    { title: 'Pool Liquidity', value: `$${stats.poolLiquidity.toLocaleString()}`, icon: TrendingUp, color: 'text-accent' },
    { title: 'System Alerts', value: stats.systemAlerts, icon: AlertCircle, color: 'text-destructive' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full px-4 py-2 text-left hover:bg-secondary rounded-md transition-colors"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate('/admin/pools')}
              className="w-full px-4 py-2 text-left hover:bg-secondary rounded-md transition-colors"
            >
              Pool Management
            </button>
            <button
              onClick={() => navigate('/admin/governance')}
              className="w-full px-4 py-2 text-left hover:bg-secondary rounded-md transition-colors"
            >
              Governance
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">No recent alerts</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
