import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Activity, AlertCircle, TrendingUp, Bot, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

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
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="text-center text-muted-foreground">Loading admin dashboard...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-border">
              <Shield className="h-6 w-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">System management & oversight</p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary text-primary">Admin Access</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="game-card border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="game-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => navigate('/admin/agents')}
                className="w-full px-4 py-3 text-left hover:bg-primary/10 rounded-lg transition-all hover:translate-x-1 flex items-center gap-3 group"
              >
                <Bot className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">AI Agents Management</span>
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full px-4 py-3 text-left hover:bg-primary/10 rounded-lg transition-all hover:translate-x-1 flex items-center gap-3 group"
              >
                <Users className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                <span className="font-medium">Manage Users</span>
              </button>
              <button
                onClick={() => navigate('/admin/pools')}
                className="w-full px-4 py-3 text-left hover:bg-primary/10 rounded-lg transition-all hover:translate-x-1 flex items-center gap-3 group"
              >
                <TrendingUp className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                <span className="font-medium">Pool Management</span>
              </button>
              <button
                onClick={() => navigate('/admin/algorithms')}
                className="w-full px-4 py-3 text-left hover:bg-primary/10 rounded-lg transition-all hover:translate-x-1 flex items-center gap-3 group"
              >
                <Activity className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                <span className="font-medium">Algorithm Management</span>
              </button>
              <button
                onClick={() => navigate('/admin/make-admin')}
                className="w-full px-4 py-3 text-left hover:bg-warning/10 rounded-lg transition-all hover:translate-x-1 flex items-center gap-3 group border-t border-border mt-2 pt-4"
              >
                <Shield className="h-5 w-5 text-warning group-hover:scale-110 transition-transform" />
                <span className="font-medium text-warning">Grant Admin Access</span>
              </button>
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">No recent alerts</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
