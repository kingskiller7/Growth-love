import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimePrices } from '@/hooks/useRealtimePrices';
import { 
  Users, Activity, AlertCircle, TrendingUp, Bot, 
  Shield, DollarSign, Zap, ArrowUpRight, ArrowDownRight,
  Database, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AdminDashboardCharts } from '@/components/admin/AdminDashboardCharts';

const miniChartData = [
  { value: 400 }, { value: 300 }, { value: 500 }, { value: 280 },
  { value: 590 }, { value: 320 }, { value: 450 }, { value: 600 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    totalTransactions: 0,
    poolLiquidity: 0,
    systemAlerts: 0,
    activeAgents: 0,
    totalAgents: 0,
    totalVolume: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { prices, connected } = useRealtimePrices();

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, transactionsRes, poolsRes, alertsRes, agentsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('pools').select('total_liquidity_usd'),
        supabase.from('security_alerts').select('id', { count: 'exact', head: true }).eq('acknowledged', false),
        supabase.from('agents').select('id, status'),
      ]);

      const totalLiquidity = poolsRes.data?.reduce((sum, pool) => sum + Number(pool.total_liquidity_usd), 0) || 0;
      const activeAgents = agentsRes.data?.filter(a => a.status === 'active').length || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        activeSessions: 0,
        totalTransactions: transactionsRes.count || 0,
        poolLiquidity: totalLiquidity,
        systemAlerts: alertsRes.count || 0,
        activeAgents,
        totalAgents: agentsRes.data?.length || 0,
        totalVolume: 2400000,
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

  const fetchRecentActivity = async () => {
    try {
      const { data } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      change: '+12.5%',
      trend: 'up',
      icon: Users, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      title: 'Total Volume', 
      value: `$${(stats.totalVolume / 1000000).toFixed(1)}M`, 
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign, 
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    { 
      title: 'Pool Liquidity', 
      value: `$${stats.poolLiquidity.toLocaleString()}`, 
      change: '+5.4%',
      trend: 'up',
      icon: Database, 
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    { 
      title: 'Active Agents', 
      value: `${stats.activeAgents}/${stats.totalAgents}`, 
      change: 'Running',
      trend: 'up',
      icon: Bot, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      title: 'Transactions', 
      value: stats.totalTransactions.toLocaleString(), 
      change: '+15.3%',
      trend: 'up',
      icon: Activity, 
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    { 
      title: 'System Alerts', 
      value: stats.systemAlerts.toString(), 
      change: stats.systemAlerts > 0 ? 'Action needed' : 'All clear',
      trend: stats.systemAlerts > 0 ? 'down' : 'up',
      icon: AlertCircle, 
      color: stats.systemAlerts > 0 ? 'text-destructive' : 'text-primary',
      bg: stats.systemAlerts > 0 ? 'bg-destructive/10' : 'bg-primary/10'
    },
  ];

  const quickActions = [
    { label: 'AI Agents', icon: Bot, path: '/admin/agents', color: 'text-primary' },
    { label: 'Users', icon: Users, path: '/admin/users', color: 'text-accent' },
    { label: 'Pools', icon: Database, path: '/admin/pools', color: 'text-accent' },
    { label: 'Analytics', icon: TrendingUp, path: '/admin/analytics', color: 'text-primary' },
    { label: 'Algorithms', icon: Activity, path: '/admin/algorithms', color: 'text-accent' },
    { label: 'Backtesting', icon: Zap, path: '/admin/backtest', color: 'text-warning' },
    { label: 'Security', icon: Shield, path: '/admin/security', color: 'text-destructive' },
  ];

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
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and management</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={connected ? 'border-primary text-primary' : 'border-destructive text-destructive'}>
              <span className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-primary' : 'bg-destructive'}`} />
              {connected ? 'Live' : 'Offline'}
            </Badge>
            <Button variant="outline" onClick={() => { fetchStats(); fetchRecentActivity(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold font-mono">{stat.value}</div>
                    <div className={`flex items-center text-xs mt-1 ${stat.trend === 'up' ? 'text-primary' : 'text-destructive'}`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="w-20 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={miniChartData}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={stat.trend === 'up' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.path}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 hover:border-primary/50"
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.event_type}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.event_description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Prices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Live Market Prices
              {connected && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {prices.slice(0, 5).map((price) => (
                <div key={price.symbol} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{price.symbol}</span>
                    <span className={`text-xs ${price.change_24h >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {price.change_24h >= 0 ? '+' : ''}{price.change_24h?.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-lg font-bold font-mono">${price.price?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        <AdminDashboardCharts />
      </div>
    </AdminLayout>
  );
}
