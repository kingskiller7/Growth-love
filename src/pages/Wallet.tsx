import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Copy, QrCode, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockBalances = [
  { symbol: "DEW", name: "DEW Token", balance: 45050, value: 45050, icon: "💎" },
  { symbol: "BTC", name: "Bitcoin", balance: 0.5432, value: 23490, icon: "₿" },
  { symbol: "ETH", name: "Ethereum", balance: 8.2341, value: 13814, icon: "Ξ" },
  { symbol: "USDT", name: "Tether", balance: 6517.23, value: 6517, icon: "₮" },
];

const mockTransactions = [
  { type: "Deposit", asset: "USDT", amount: "5,000", status: "completed", time: "2 hours ago", hash: "0x1234...5678" },
  { type: "Withdrawal", asset: "BTC", amount: "0.2", status: "completed", time: "1 day ago", hash: "0x8765...4321" },
  { type: "Deposit", asset: "ETH", amount: "5.0", status: "pending", time: "2 days ago", hash: "0xabcd...efgh" },
  { type: "Withdrawal", asset: "USDT", amount: "2,500", status: "completed", time: "3 days ago", hash: "0xijkl...mnop" },
];

export default function Wallet() {
  const navigate = useNavigate();
  const totalValue = mockBalances.reduce((sum, balance) => sum + balance.value, 0);

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
            {mockBalances.map((asset, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                    {asset.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold">{asset.balance.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    ${asset.value.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
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
            <div className="space-y-3">
              {mockTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "Deposit" ? "bg-primary/20" : "bg-destructive/20"
                    }`}>
                      {tx.type === "Deposit" ? (
                        <ArrowDownRight className="h-5 w-5 text-primary" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{tx.type} {tx.asset}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {tx.time}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => navigator.clipboard.writeText(tx.hash)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{tx.amount}</div>
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
