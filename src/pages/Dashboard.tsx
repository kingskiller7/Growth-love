import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Zap } from "lucide-react";
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTransactions } from '@/hooks/useTransactions';
import { useAlgorithms } from '@/hooks/useAlgorithms';
import { useNavigate } from 'react-router-dom';
import { LivePricesWidget } from '@/components/dashboard/LivePricesWidget';

export default function Dashboard() {
  const { portfolio, loading: portfolioLoading } = usePortfolio();
  const { transactions } = useTransactions();
  const { algorithms } = useAlgorithms();
  const navigate = useNavigate();

  if (portfolioLoading) {
    return (
      <MainLayout>
        <div className="container px-4 py-6">
          <div className="text-center text-muted-foreground">Loading dashboard...</div>
        </div>
      </MainLayout>
    );
  }

  const portfolioValue = portfolio?.total_value_usd || 0;
  const change24h = portfolio?.change_24h || 0;
  const changePercent = portfolio?.change_24h_percent || 0;
  const activeAlgos = algorithms.filter(a => a.is_active).length;
  const recentTransactions = transactions.slice(0, 4);

  return (
    <MainLayout>
      <div className="container px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Welcome back to Growth</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigate('/deposit')} className="flex-1 sm:flex-initial">
              <ArrowDownRight className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Deposit</span>
            </Button>
            <Button onClick={() => navigate('/trade')} className="flex-1 sm:flex-initial">
              <ArrowUpRight className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Trade Now</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono">${portfolioValue.toLocaleString()}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">≈ {portfolioValue.toFixed(2)} DEW</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">24h Change</CardTitle>
              <TrendingUp className={`h-3 w-3 sm:h-4 sm:w-4 ${changePercent >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className={`text-xl sm:text-2xl font-bold font-mono ${changePercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {change24h >= 0 ? '+' : ''}${Math.abs(change24h).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono text-primary">+$0.00</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Algos</CardTitle>
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono text-primary">{activeAlgos}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{algorithms.length} available</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Prices Widget */}
        <LivePricesWidget />

        {/* Recent Transactions - Full Width */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              {recentTransactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base col-span-2">
                  No transactions yet
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                        tx.transaction_type === "deposit" ? "bg-primary/20" : tx.transaction_type === "withdrawal" ? "bg-destructive/20" : "bg-muted"
                      }`}>
                        {tx.transaction_type === "deposit" ? (
                          <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        ) : tx.transaction_type === "withdrawal" ? (
                          <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold capitalize text-sm sm:text-base truncate">{tx.transaction_type} {tx.asset_symbol}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="font-mono text-sm sm:text-base">{tx.amount}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground capitalize">{tx.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
