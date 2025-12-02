import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalytics } from '@/hooks/useAnalytics';
import { 
  TrendingUp, TrendingDown, Activity, Users, 
  DollarSign, BarChart3, Download, RefreshCw,
  PieChart, LineChart
} from 'lucide-react';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';

const COLORS = ['hsl(160, 100%, 50%)', 'hsl(200, 100%, 50%)', 'hsl(280, 100%, 50%)', 'hsl(40, 100%, 50%)'];

const mockTradingData = [
  { date: 'Mon', volume: 45000, profit: 1200 },
  { date: 'Tue', volume: 52000, profit: 1800 },
  { date: 'Wed', volume: 48000, profit: -500 },
  { date: 'Thu', volume: 61000, profit: 2400 },
  { date: 'Fri', volume: 55000, profit: 1900 },
  { date: 'Sat', volume: 38000, profit: 800 },
  { date: 'Sun', volume: 42000, profit: 1100 },
];

const assetDistribution = [
  { name: 'BTC', value: 45 },
  { name: 'ETH', value: 30 },
  { name: 'DEW', value: 15 },
  { name: 'Others', value: 10 },
];

export default function AdminAnalytics() {
  const { loading, data, fetchAnalytics } = useAnalytics();
  const [timeframe, setTimeframe] = useState('7d');
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      const result = await fetchAnalytics({ type: 'system_health', timeframe });
      setSystemHealth(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const stats = [
    { 
      title: 'Total Volume', 
      value: '$2.4M', 
      change: '+12.5%', 
      trend: 'up',
      icon: DollarSign 
    },
    { 
      title: 'Active Users', 
      value: systemHealth?.total_users || '0', 
      change: '+8.2%', 
      trend: 'up',
      icon: Users 
    },
    { 
      title: 'Total Trades', 
      value: systemHealth?.total_trades || '0', 
      change: '+15.3%', 
      trend: 'up',
      icon: Activity 
    },
    { 
      title: 'Win Rate', 
      value: '67.8%', 
      change: '-2.1%', 
      trend: 'down',
      icon: BarChart3 
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Analytics</h1>
            <p className="text-muted-foreground">Platform-wide performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{stat.value}</div>
                <div className={`flex items-center text-xs mt-1 ${
                  stat.trend === 'up' ? 'text-primary' : 'text-destructive'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change} from last period
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="volume" className="space-y-4">
          <TabsList>
            <TabsTrigger value="volume" className="gap-2">
              <LineChart className="h-4 w-4" />
              Volume
            </TabsTrigger>
            <TabsTrigger value="distribution" className="gap-2">
              <PieChart className="h-4 w-4" />
              Distribution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="volume">
            <Card>
              <CardHeader>
                <CardTitle>Trading Volume & Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLine data={mockTradingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--accent))' }}
                      />
                    </RechartsLine>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Asset Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={assetDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {assetDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Health */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pool Liquidity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pool 1 (DEW)</span>
                  <span className="font-mono font-bold">${(systemHealth?.pool_liquidity?.[0] || 0).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pool 2 (Multi)</span>
                  <span className="font-mono font-bold">${(systemHealth?.pool_liquidity?.[1] || 0).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Agents</span>
                  <span className="font-mono font-bold text-primary">{systemHealth?.active_agents || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Agents</span>
                  <span className="font-mono font-bold">{systemHealth?.total_agents || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Win Rate</span>
                  <span className="font-mono font-bold text-primary">72.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Profit</span>
                  <span className="font-mono font-bold text-primary">+$12,450</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
