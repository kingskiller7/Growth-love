import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Copy, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useTransactions } from "@/hooks/useTransactions";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function Wallet() {
  const navigate = useNavigate();
  const { portfolio, holdings, loading: portfolioLoading } = usePortfolio();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { toast } = useToast();

  const totalValue = portfolio?.total_value_usd || 0;

  const handleCopyHash = (hash: string | null) => {
    if (hash) {
      navigator.clipboard.writeText(hash);
      toast({
        title: "Copied",
        description: "Transaction hash copied to clipboard",
      });
    }
  };

  if (portfolioLoading) {
    return (
      <MainLayout>
        <div className="container px-4 py-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Wallet</h1>
            <p className="text-muted-foreground">Manage your assets and transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/deposit")}>
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Deposit
            </Button>
            <Button onClick={() => navigate("/withdraw")}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <div className="text-4xl font-bold font-mono">${totalValue.toLocaleString()}</div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                ≈ {totalValue} DEW
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {holdings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No assets yet</p>
                <p className="text-sm mt-2">Make a deposit to get started</p>
              </div>
            ) : (
              holdings.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-lg">{asset.asset_symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="font-semibold">{asset.asset_name}</div>
                      <div className="text-sm text-muted-foreground">{asset.asset_symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold">
                      {asset.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      ${(asset.value_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.transaction_type === "deposit" ? "bg-primary/20" : "bg-destructive/20"
                      }`}>
                        {tx.transaction_type === "deposit" ? (
                          <ArrowDownRight className="h-5 w-5 text-primary" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold capitalize">{tx.transaction_type} {tx.asset_symbol}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                          {tx.transaction_hash && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => handleCopyHash(tx.transaction_hash)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </div>
                      <Badge
                        variant={tx.status === "completed" ? "secondary" : "outline"}
                        className={tx.status === "completed" ? "bg-primary/10 text-primary" : ""}
                      >
                        {tx.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
