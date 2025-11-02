import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Zap } from "lucide-react";
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTransactions } from '@/hooks/useTransactions';
import { useAlgorithms } from '@/hooks/useAlgorithms';
import { useNavigate } from 'react-router-dom';

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
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to Growth</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/deposit')}>
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Deposit
            </Button>
            <Button onClick={() => navigate('/trade')}>
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
              <div className="text-2xl font-bold font-mono">${portfolioValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">≈ {portfolioValue.toFixed(2)} DEW</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Change</CardTitle>
              <TrendingUp className={`h-4 w-4 ${changePercent >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${changePercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {change24h >= 0 ? '+' : ''}${Math.abs(change24h).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-primary">+$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Algos</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-primary">{activeAlgos}</div>
              <p className="text-xs text-muted-foreground mt-1">{algorithms.length} available</p>
            </CardContent>
          </Card>
        </div>

        <Card className="game-card">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No transactions yet
                  </div>
                ) : (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.transaction_type === "deposit" ? "bg-primary/20" : tx.transaction_type === "withdrawal" ? "bg-destructive/20" : "bg-muted"
                        }`}>
                          {tx.transaction_type === "deposit" ? (
                            <ArrowDownRight className="h-4 w-4 text-primary" />
                          ) : tx.transaction_type === "withdrawal" ? (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold capitalize">{tx.transaction_type} {tx.asset_symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">{tx.amount}</div>
                        <div className="text-sm text-muted-foreground capitalize">{tx.status}</div>
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
