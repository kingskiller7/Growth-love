import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, TrendingUp, ArrowUpRight, Search, Filter, Loader2 } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";

export default function Portfolio() {
  const { portfolio, holdings, loading } = usePortfolio();

  if (loading) {
    return (
      <MainLayout>
        <div className="container px-4 py-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const totalValue = portfolio?.total_value_usd || 0;
  const change24h = portfolio?.change_24h_percent || 0;
  const bestPerformer = holdings.reduce((best, holding) => 
    (holding.change_24h_percent || 0) > (best.change_24h_percent || 0) ? holding : best
  , holdings[0] || { asset_symbol: 'N/A', change_24h_percent: 0 });

  const totalAllocation = holdings.reduce((sum, h) => sum + (h.value_usd || 0), 0);

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
              <div className="text-3xl font-bold font-mono">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">Across {holdings.length} assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Change</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold font-mono ${change24h >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {change24h >= 0 ? '+' : ''}${(portfolio?.change_24h || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bestPerformer?.asset_symbol || 'N/A'}</div>
              <p className={`text-xs mt-1 ${(bestPerformer?.change_24h_percent || 0) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {(bestPerformer?.change_24h_percent || 0) >= 0 ? '+' : ''}{(bestPerformer?.change_24h_percent || 0).toFixed(2)}% today
              </p>
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
              {holdings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No holdings yet</p>
                  <p className="text-sm mt-2">Start trading to build your portfolio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {holdings.map((holding) => (
                    <div key={holding.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-bold text-sm">{holding.asset_symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-semibold">{holding.asset_name}</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {holding.amount.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })} {holding.asset_symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          ${(holding.value_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm font-mono ${(holding.change_24h_percent || 0) > 0 ? "text-primary" : (holding.change_24h_percent || 0) < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                          {(holding.change_24h_percent || 0) > 0 ? "+" : ""}{(holding.change_24h_percent || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  {holdings.map((holding) => {
                    const allocation = totalAllocation > 0 ? ((holding.value_usd || 0) / totalAllocation * 100) : 0;
                    return (
                      <div key={holding.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{holding.asset_symbol}</span>
                          <span className="font-mono">{allocation.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${allocation}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
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
