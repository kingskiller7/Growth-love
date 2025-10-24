import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, Bot, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockPositions = [
  { asset: "BTC/USDT", amount: 0.5, value: 21500, change: 3.2, profit: 650 },
  { asset: "ETH/USDT", amount: 8.2, value: 13800, change: -1.5, profit: -207 },
  { asset: "SOL/USDT", amount: 150, value: 9750, change: 5.8, profit: 535 },
];

const mockTransactions = [
  { type: "Buy", asset: "BTC", amount: "0.5", price: "$42,500", time: "2 hours ago", status: "completed" },
  { type: "Sell", asset: "ETH", amount: "2.0", price: "$1,680", time: "5 hours ago", status: "completed" },
  { type: "Buy", asset: "SOL", amount: "50", price: "$65", time: "1 day ago", status: "completed" },
  { type: "Deposit", asset: "USDT", amount: "5,000", price: "-", time: "2 days ago", status: "completed" },
];

const mockAgents = [
  { name: "Momentum Trader", status: "active", profit: 12.5, trades: 45 },
  { name: "Grid Bot", status: "active", profit: 8.3, trades: 128 },
  { name: "Arbitrage Scout", status: "active", profit: 5.7, trades: 89 },
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to Growth</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Deposit
            </Button>
            <Button>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Trade Now
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">$45,050.00</div>
              <p className="text-xs text-muted-foreground mt-1">≈ 45,050 DEW</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Change</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-primary">+5.23%</div>
              <p className="text-xs text-muted-foreground mt-1">+$2,235.12</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-primary">+$978.00</div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">3</div>
              <p className="text-xs text-muted-foreground mt-1">262 trades today</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Positions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPositions.map((position, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-semibold">{position.asset}</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {position.amount} · ${position.value.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold font-mono ${position.change > 0 ? "text-primary" : "text-destructive"}`}>
                      {position.change > 0 ? "+" : ""}{position.change}%
                    </div>
                    <div className={`text-sm font-mono ${position.profit > 0 ? "text-primary" : "text-destructive"}`}>
                      {position.profit > 0 ? "+" : ""}${position.profit}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Agent Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAgents.map((agent, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div>
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">{agent.trades} trades</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      +{agent.profit}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "Buy" ? "bg-primary/20" : tx.type === "Sell" ? "bg-destructive/20" : "bg-muted"
                    }`}>
                      {tx.type === "Buy" ? (
                        <ArrowDownRight className="h-4 w-4 text-primary" />
                      ) : tx.type === "Sell" ? (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{tx.type} {tx.asset}</div>
                      <div className="text-sm text-muted-foreground">{tx.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{tx.amount}</div>
                    <div className="text-sm text-muted-foreground">{tx.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
