import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const mockOrderBook = {
  asks: [
    { price: 43250.50, amount: 0.5432, total: 23490.37 },
    { price: 43251.00, amount: 1.2341, total: 53385.24 },
    { price: 43251.50, amount: 0.8765, total: 37908.19 },
  ],
  bids: [
    { price: 43249.50, amount: 0.6543, total: 28296.82 },
    { price: 43249.00, amount: 1.4567, total: 62985.28 },
    { price: 43248.50, amount: 0.9876, total: 42710.66 },
  ],
};

const mockOpenOrders = [
  { type: "Limit Buy", pair: "BTC/USDT", amount: 0.5, price: 42500, filled: 0, status: "open" },
  { type: "Limit Sell", pair: "ETH/USDT", amount: 2.0, price: 1720, filled: 0, status: "open" },
];

export default function Trade() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState("market");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  return (
    <MainLayout>
      <div className="container px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trade</h1>
            <p className="text-muted-foreground">Execute trades across multiple DEXs</p>
          </div>
          <Select value={selectedPair} onValueChange={setSelectedPair}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
              <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
              <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
              <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">BTC/USDT</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.45%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">$43,250.00</div>
              <div className="text-sm text-muted-foreground mt-1">24h Vol: $2.4B</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">24h High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-primary">$44,120.50</div>
              <div className="text-sm text-muted-foreground mt-1">Peak at 14:32 UTC</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">24h Low</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-destructive">$42,180.00</div>
              <div className="text-sm text-muted-foreground mt-1">Bottom at 08:15 UTC</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chart visualization coming soon</p>
                    <p className="text-sm mt-1">TradingView integration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Price (USDT)</span>
                      <span>Amount (BTC)</span>
                      <span>Total (USDT)</span>
                    </div>
                    {mockOrderBook.asks.reverse().map((ask, index) => (
                      <div key={index} className="flex justify-between text-sm font-mono">
                        <span className="text-destructive">{ask.price.toFixed(2)}</span>
                        <span>{ask.amount.toFixed(4)}</span>
                        <span className="text-muted-foreground">{ask.total.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="my-2 py-2 border-y border-border">
                      <div className="text-center font-mono font-bold">43,250.00</div>
                      <div className="text-center text-xs text-muted-foreground">Spread: $1.00</div>
                    </div>
                    {mockOrderBook.bids.map((bid, index) => (
                      <div key={index} className="flex justify-between text-sm font-mono">
                        <span className="text-primary">{bid.price.toFixed(2)}</span>
                        <span>{bid.amount.toFixed(4)}</span>
                        <span className="text-muted-foreground">{bid.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="buy" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>
                  <TabsContent value="buy" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Order Type</Label>
                      <Select value={orderType} onValueChange={setOrderType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                          <SelectItem value="stop">Stop-Loss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {orderType === "limit" && (
                      <div className="space-y-2">
                        <Label>Price (USDT)</Label>
                        <Input
                          type="number"
                          placeholder="43,250.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Amount (BTC)</Label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="font-mono"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("0.25")}>
                          25%
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("0.50")}>
                          50%
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("0.75")}>
                          75%
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("1.00")}>
                          100%
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-mono">45,050.00 USDT</span>
                      </div>
                      {amount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-mono">
                            {(parseFloat(amount) * 43250).toLocaleString()} USDT
                          </span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full" size="lg" variant="success">
                      Buy BTC
                    </Button>
                  </TabsContent>
                  <TabsContent value="sell" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Order Type</Label>
                      <Select value={orderType} onValueChange={setOrderType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                          <SelectItem value="stop">Stop-Loss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {orderType === "limit" && (
                      <div className="space-y-2">
                        <Label>Price (USDT)</Label>
                        <Input
                          type="number"
                          placeholder="43,250.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Amount (BTC)</Label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="font-mono"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">25%</Button>
                        <Button variant="outline" size="sm" className="flex-1">50%</Button>
                        <Button variant="outline" size="sm" className="flex-1">75%</Button>
                        <Button variant="outline" size="sm" className="flex-1">100%</Button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-mono">0.5432 BTC</span>
                      </div>
                    </div>

                    <Button className="w-full" size="lg" variant="destructive">
                      Sell BTC
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {mockOpenOrders.length > 0 ? (
                  <div className="space-y-3">
                    {mockOpenOrders.map((order, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{order.type}</Badge>
                          <span className="text-xs text-muted-foreground">{order.pair}</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-mono">{order.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-mono">${order.price}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Cancel Order
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No open orders
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
