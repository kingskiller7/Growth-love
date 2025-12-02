import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBacktest, BacktestResult } from '@/hooks/useBacktest';
import { useAlgorithms } from '@/hooks/useAlgorithms';
import { 
  Play, TrendingUp, TrendingDown, Activity, 
  Calendar, DollarSign, Target, AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminBacktest() {
  const { loading, results, runBacktest } = useBacktest();
  const { algorithms } = useAlgorithms();
  const [config, setConfig] = useState({
    algorithmId: '',
    startDate: '2024-01-01',
    endDate: '2024-12-01',
    initialCapital: 10000,
  });

  const handleRunBacktest = async () => {
    if (!config.algorithmId) return;
    await runBacktest(config);
  };

  // Mock equity curve data
  const equityCurve = results ? Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    equity: config.initialCapital * (1 + (Math.random() * 0.1 - 0.03) * i),
    drawdown: Math.random() * 10,
  })) : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Backtesting Engine</h1>
          <p className="text-muted-foreground">Test trading strategies against historical data</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Backtest Configuration</CardTitle>
              <CardDescription>Set up your backtest parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Algorithm</Label>
                <Select 
                  value={config.algorithmId} 
                  onValueChange={(v) => setConfig(prev => ({ ...prev, algorithmId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    {algorithms.map((algo) => (
                      <SelectItem key={algo.id} value={algo.id}>
                        {algo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={config.startDate}
                    onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    value={config.endDate}
                    onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Initial Capital ($)</Label>
                <Input 
                  type="number" 
                  value={config.initialCapital}
                  onChange={(e) => setConfig(prev => ({ ...prev, initialCapital: Number(e.target.value) }))}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleRunBacktest}
                disabled={loading || !config.algorithmId}
              >
                <Play className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Running...' : 'Run Backtest'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Backtest Results</CardTitle>
              <CardDescription>
                {results ? `${results.algorithm_name} - ${results.period?.days} days` : 'Run a backtest to see results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Final Capital</span>
                      </div>
                      <p className="text-2xl font-bold font-mono text-primary">
                        ${results.final_capital?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">ROI</span>
                      </div>
                      <p className={`text-2xl font-bold font-mono ${Number(results.roi_percent) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {results.roi_percent}%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Target className="h-4 w-4" />
                        <span className="text-sm">Win Rate</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">{results.win_rate}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Max Drawdown</span>
                      </div>
                      <p className="text-2xl font-bold font-mono text-warning">{results.max_drawdown}%</p>
                    </div>
                  </div>

                  {/* Equity Curve */}
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={equityCurve}>
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
                          dataKey="equity" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Trade Statistics */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                      <p className="text-xl font-bold font-mono">{results.total_trades}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Winning</p>
                      <p className="text-xl font-bold font-mono text-primary">{results.winning_trades}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Losing</p>
                      <p className="text-xl font-bold font-mono text-destructive">{results.losing_trades}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure and run a backtest to see results</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
