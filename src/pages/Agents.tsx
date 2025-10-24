import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot, Play, Pause, Settings, TrendingUp, Activity, AlertCircle, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const mockAgents = [
  {
    id: 1,
    name: "Momentum Trader",
    status: "active",
    profit: 12.5,
    trades: 45,
    winRate: 68,
    cpu: 34,
    memory: 256,
    uptime: "3d 12h",
  },
  {
    id: 2,
    name: "Grid Bot",
    status: "active",
    profit: 8.3,
    trades: 128,
    winRate: 72,
    cpu: 28,
    memory: 192,
    uptime: "7d 2h",
  },
  {
    id: 3,
    name: "Arbitrage Scout",
    status: "active",
    profit: 5.7,
    trades: 89,
    winRate: 65,
    cpu: 42,
    memory: 384,
    uptime: "1d 8h",
  },
  {
    id: 4,
    name: "Trend Follower",
    status: "paused",
    profit: -2.1,
    trades: 23,
    winRate: 48,
    cpu: 0,
    memory: 0,
    uptime: "Paused",
  },
];

export default function Agents() {
  const [agents, setAgents] = useState(mockAgents);

  const toggleAgent = (id: number) => {
    setAgents(agents.map(agent =>
      agent.id === id
        ? { ...agent, status: agent.status === "active" ? "paused" : "active" }
        : agent
    ));
  };

  const activeAgents = agents.filter(a => a.status === "active").length;
  const totalProfit = agents.reduce((sum, agent) => sum + agent.profit, 0);
  const avgWinRate = agents.reduce((sum, agent) => sum + agent.winRate, 0) / agents.length;

  return (
    <MainLayout>
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Agents</h1>
            <p className="text-muted-foreground">Monitor and manage trading agents</p>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              Stop All
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Agent
            </Button>
          </div>
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
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold font-mono ${totalProfit > 0 ? "text-primary" : "text-destructive"}`}>
                {totalProfit > 0 ? "+" : ""}{totalProfit.toFixed(2)}%
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
              <div className="text-3xl font-bold font-mono">{avgWinRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Success ratio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">
                {agents.reduce((sum, a) => sum + a.trades, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {agents.map((agent) => (
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
                        Uptime: {agent.uptime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className={agent.profit > 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}
                      >
                        {agent.profit > 0 ? "+" : ""}{agent.profit}%
                      </Badge>
                    </div>
                    <Switch
                      checked={agent.status === "active"}
                      onCheckedChange={() => toggleAgent(agent.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Trades</Label>
                    <p className="font-mono font-semibold mt-1">{agent.trades}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Win Rate</Label>
                    <p className="font-mono font-semibold mt-1">{agent.winRate}%</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge variant={agent.status === "active" ? "default" : "secondary"} className="mt-1">
                      {agent.status}
                    </Badge>
                  </div>
                </div>

                {agent.status === "active" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Label className="text-muted-foreground">CPU Usage</Label>
                        <span className="font-mono">{agent.cpu}%</span>
                      </div>
                      <Progress value={agent.cpu} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Label className="text-muted-foreground">Memory</Label>
                        <span className="font-mono">{agent.memory} MB</span>
                      </div>
                      <Progress value={(agent.memory / 512) * 100} className="h-2" />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Logs
                  </Button>
                  {agent.status === "active" ? (
                    <Button variant="outline" onClick={() => toggleAgent(agent.id)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={() => toggleAgent(agent.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
