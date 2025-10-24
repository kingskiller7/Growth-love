import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, TrendingUp, ArrowUpRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const mockHoldings = [
  { asset: "BTC", name: "Bitcoin", amount: 0.5432, value: 23490.37, change: 3.2, allocation: 35 },
  { asset: "ETH", name: "Ethereum", amount: 8.2341, value: 13814.20, change: -1.5, allocation: 21 },
  { asset: "SOL", name: "Solana", amount: 150.5, value: 9782.50, change: 5.8, allocation: 15 },
  { asset: "BNB", name: "Binance Coin", amount: 42.1, value: 12945.70, change: 2.1, allocation: 19 },
  { asset: "USDT", name: "Tether", amount: 6517.23, value: 6517.23, change: 0, allocation: 10 },
];

export default function Portfolio() {
  const totalValue = mockHoldings.reduce((sum, holding) => sum + holding.value, 0);

  return (
    <MainLayout>
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-muted-foreground">Track and manage your assets</p>
          </div>
          <Button>
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Rebalance
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across {mockHoldings.length} assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Change</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary">+2.87%</div>
              <p className="text-xs text-muted-foreground mt-1">+$1,845.32</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">SOL</div>
              <p className="text-xs text-primary mt-1">+5.8% today</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Holdings</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockHoldings.map((holding, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-bold text-sm">{holding.asset.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{holding.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {holding.amount} {holding.asset}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold">${holding.value.toLocaleString()}</div>
                      <div className={`text-sm font-mono ${holding.change > 0 ? "text-primary" : holding.change < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                        {holding.change > 0 ? "+" : ""}{holding.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-40 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Pie chart visualization</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {mockHoldings.map((holding, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{holding.asset}</span>
                        <span className="font-mono">{holding.allocation}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${holding.allocation}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Historical performance chart</p>
                <p className="text-sm mt-1">Time series visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
