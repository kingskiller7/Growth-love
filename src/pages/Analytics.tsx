import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, TrendingDown, Download, Calendar, 
  Activity, DollarSign, Target, RefreshCw, PieChart
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart as RechartsPie, Pie, Cell
} from 'recharts';

const COLORS = ['hsl(160, 100%, 50%)', 'hsl(200, 100%, 50%)', 'hsl(280, 100%, 50%)', 'hsl(40, 100%, 50%)'];

export default function Analytics() {
  const { user } = useAuth();
  const { loading, fetchAnalytics } = useAnalytics();
  const [timeframe, setTimeframe] = useState('30d');
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [tradingData, setTradingData] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe, user]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    try {
      const [portfolio, trading] = await Promise.all([
        fetchAnalytics({ type: 'portfolio', timeframe, userId: user.id }),
        fetchAnalytics({ type: 'trading_performance', timeframe, userId: user.id }),
      ]);
      
      setPortfolioData(portfolio);
      setTradingData(trading);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Generate chart data
  const performanceData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    profit: Math.random() * 1000 - 200,
    cumulative: (i + 1) * (Math.random() * 50 + 10),
  }));

  const assetAllocation = portfolioData?.asset_allocation || [
    { name: 'BTC', value: 45, color: COLORS[0] },
    { name: 'ETH', value: 30, color: COLORS[1] },
    { name: 'Others', value: 25, color: COLORS[2] },
  ];

  const stats = [
    {
      title: 'Total Profit',
      value: `$${(tradingData?.total_profit || 0).toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Total Trades',
      value: tradingData?.total_trades || 0,
      change: '+8 this week',
      trend: 'up',
      icon: Activity,
    },
    {
      title: 'Win Rate',
      value: `${((tradingData?.win_rate || 0) * 100).toFixed(1)}%`,
      change: '+2.3%',
      trend: 'up',
      icon: Target,
    },
    {
      title: 'Portfolio Value',
      value: `$${(portfolioData?.total_value || 0).toLocaleString()}`,
      change: `${portfolioData?.change_24h_percent || 0}%`,
      trend: (portfolioData?.change_24h_percent || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUp,
    },
  ];

  return (
    <MainLayout>
      <div className="container px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-muted-foreground">Performance insights and reports</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
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
        <div className="grid gap-4 md:grid-cols-4">
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
                <div className={`flex items-center text-xs mt-1 ${stat.trend === 'up' ? 'text-primary' : 'text-destructive'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="assets">Asset Analysis</TabsTrigger>
            <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profit/Loss Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cumulative" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary) / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily P&L</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
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
                          dataKey="profit" 
                          stroke="hsl(var(--accent))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trade Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Winning Trades</span>
                      <span className="font-mono font-bold text-primary">{tradingData?.winning_trades || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Losing Trades</span>
                      <span className="font-mono font-bold text-destructive">{tradingData?.losing_trades || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Avg Trade Value</span>
                      <span className="font-mono font-bold">${(tradingData?.avg_trade_value || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Best Trade</span>
                      <span className="font-mono font-bold text-primary">+$1,245.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Worst Trade</span>
                      <span className="font-mono font-bold text-destructive">-$320.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Asset Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={assetAllocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {assetAllocation.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Holdings Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assetAllocation.map((asset: any, index: number) => (
                      <div key={asset.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{asset.name}</span>
                          <span className="font-mono">{asset.value}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${asset.value}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Max Drawdown</p>
                    <p className="text-2xl font-bold font-mono text-warning">-12.4%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Sharpe Ratio</p>
                    <p className="text-2xl font-bold font-mono text-primary">1.85</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Volatility</p>
                    <p className="text-2xl font-bold font-mono">24.6%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Beta</p>
                    <p className="text-2xl font-bold font-mono">0.92</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
