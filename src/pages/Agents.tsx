import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Settings, AlertCircle, Activity, TrendingUp, Shield } from "lucide-react";
import { useAgents } from '@/hooks/useAgents';
import { useAdmin } from '@/hooks/useAdmin';

export default function Agents() {
  const { agents, performance, loading, stopAllAgents, updateAgentStatus } = useAgents();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalProfit = Object.values(performance).reduce((sum, p) => sum + Number(p.total_profit || 0), 0);
  const avgWinRate = Object.values(performance).reduce((sum, p) => sum + Number(p.win_rate || 0), 0) / (Object.keys(performance).length || 1);
  const totalTrades = Object.values(performance).reduce((sum, p) => sum + Number(p.total_trades || 0), 0);

  if (loading || adminLoading) {
    return (
      <MainLayout>
        <div className="container px-4 py-6">
          <div className="text-center text-muted-foreground">Loading agents...</div>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container px-4 py-6">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Access Denied: AI Agent management is restricted to administrators only.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">AI Agents</h1>
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Admin Only
              </Badge>
            </div>
            <p className="text-muted-foreground">System-wide AI agents for automated operations</p>
          </div>
          <Button 
            variant="destructive" 
            onClick={() => stopAllAgents()}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Emergency Stop All
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{activeAgents}/{agents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className={`h-4 w-4 ${totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold font-mono ${totalProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Combined performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Win Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{((avgWinRate || 0) * 100).toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Success ratio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{totalTrades}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  No system agents found. They should have been created automatically during setup.
                </div>
              </CardContent>
            </Card>
          ) : (
            agents.map((agent) => {
              const perf = performance[agent.id];
              return (
                <Card key={agent.id} className={agent.status === "active" ? "border-primary/30" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          agent.status === "active" ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <Bot className={`h-6 w-6 ${agent.status === "active" ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle>{agent.name}</CardTitle>
                            {agent.status === "active" && (
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {agent.description || agent.strategy || 'No description'}
                          </p>
                          {agent.config?.purpose && (
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Purpose: {agent.config.purpose.replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={agent.status === "active" ? "bg-primary/10 text-primary" : "bg-muted"}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {perf ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Profit</p>
                          <p className={`font-mono font-semibold mt-1 ${Number(perf.total_profit) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            ${Number(perf.total_profit).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Trades</p>
                          <p className="font-mono font-semibold mt-1">{perf.total_trades}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                          <p className="font-mono font-semibold mt-1">{((perf.win_rate || 0) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No performance data yet
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => updateAgentStatus({ 
                          id: agent.id, 
                          status: agent.status === 'active' ? 'inactive' : 'active' 
                        })}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {agent.status === 'active' ? 'Stop' : 'Start'}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
