import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2, Sparkles, X } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { useOrders } from "@/hooks/useOrders";
import { useDexPrices } from "@/hooks/useDexPrices";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { AISuggestionsPanel } from "@/components/ai/AISuggestionsPanel";
import { TradingViewChart } from "@/components/trading/TradingViewChart";
import { formatDistanceToNow } from "date-fns";

export default function Trade() {
  const [selectedPair, setSelectedPair] = useState("BTC");
  const [orderType, setOrderType] = useState("market");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  const { prices: marketPrices, getPriceBySymbol } = useMarketData();
  const { openOrders, createOrder, cancelOrder, executeOrder } = useOrders();
  const { prices: dexPrices, fetchDexPrices, loading: dexLoading } = useDexPrices();
  const { analyze, isAnalyzing, analysis } = useAIAnalysis();

  const currentPrice = getPriceBySymbol(selectedPair);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      fetchDexPrices(selectedPair, 'USDT', parseFloat(amount));
    }
  }, [selectedPair, amount]);

  const handlePlaceOrder = async (side: 'buy' | 'sell') => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      await createOrder({
        baseAsset: selectedPair,
        quoteAsset: 'USDT',
        orderType: orderType as 'market' | 'limit' | 'stop',
        orderSide: side,
        amount: parseFloat(amount),
        price: price ? parseFloat(price) : undefined,
        stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
      });
      
      setAmount("");
      setPrice("");
      setStopPrice("");
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const change24h = currentPrice?.change_24h_percent || 0;
  const isPositive = change24h >= 0;

  return (
    <MainLayout>
      <div className="container px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Trade</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Execute trades with best price discovery</p>
          </div>
          <Select value={selectedPair} onValueChange={setSelectedPair}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {marketPrices.map((price) => (
                <SelectItem key={price.symbol} value={price.symbol}>
                  {price.symbol}/USDT
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">{selectedPair}/USDT</CardTitle>
                <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                  <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  {isPositive ? '+' : ''}{change24h.toFixed(2)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold font-mono">
                ${currentPrice?.price.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                Last updated: {currentPrice ? formatDistanceToNow(new Date(currentPrice.last_updated), { addSuffix: true }) : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Best DEX Price</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {dexLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="text-xs sm:text-sm">Fetching prices...</span>
                </div>
              ) : dexPrices?.bestQuote ? (
                <>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-primary">
                    ${dexPrices.bestQuote.price.toFixed(2)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {dexPrices.bestQuote.dex}
                  </div>
                </>
              ) : (
                <div className="text-xs sm:text-sm text-muted-foreground">Enter amount to see prices</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">24h Change</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className={`text-xl sm:text-2xl font-bold font-mono ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                ${Math.abs(currentPrice?.change_24h || 0).toFixed(2)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isPositive ? 'Gain' : 'Loss'} in 24h
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <TradingViewChart symbol={selectedPair} height={400} />

            {dexPrices && dexPrices.quotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>DEX Price Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dexPrices.quotes.map((quote, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-semibold">{quote.dex}</div>
                          <div className="text-sm text-muted-foreground">
                            Liquidity: ${(quote.liquidity / 1000000).toFixed(2)}M
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold">${quote.price.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            Gas: ${quote.gasCostUSD.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
                          placeholder={currentPrice?.price.toFixed(2) || "0.00"}
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    )}

    {orderType === "stop" && (
                      <div className="space-y-2">
                        <Label>Stop Price (USDT)</Label>
                        <Input
                          type="number"
                          placeholder={currentPrice?.price.toFixed(2) || "0.00"}
                          value={stopPrice}
                          onChange={(e) => setStopPrice(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Amount ({selectedPair})</Label>
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
                      {amount && currentPrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-mono">
                            {(parseFloat(amount) * currentPrice.price).toLocaleString()} USDT
                          </span>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={() => handlePlaceOrder('buy')}
                      disabled={!amount || parseFloat(amount) <= 0}
                    >
                      Buy {selectedPair}
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
                          placeholder={currentPrice?.price.toFixed(2) || "0.00"}
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    )}

                    {orderType === "stop" && (
                      <div className="space-y-2">
                        <Label>Stop Price (USDT)</Label>
                        <Input
                          type="number"
                          placeholder={currentPrice?.price.toFixed(2) || "0.00"}
                          value={stopPrice}
                          onChange={(e) => setStopPrice(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Amount ({selectedPair})</Label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="font-mono"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("0.25")}>25%</Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("0.50")}>50%</Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("0.75")}>75%</Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("1.00")}>100%</Button>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg" 
                      variant="destructive"
                      onClick={() => handlePlaceOrder('sell')}
                      disabled={!amount || parseFloat(amount) <= 0}
                    >
                      Sell {selectedPair}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Insights</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (currentPrice) {
                      analyze({
                          type: 'trade_suggestion',
                          data: {
                            symbol: `${selectedPair}/USDT`,
                            current_price: currentPrice.price,
                            price_change_24h: currentPrice.change_24h_percent,
                            volume_24h: currentPrice.volume_24h,
                          }
                        });
                        setShowAIAnalysis(true);
                      }
                    }}
                    disabled={isAnalyzing || !currentPrice}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Get AI Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAIAnalysis && analysis && (
                  <div className="p-3 rounded-lg bg-secondary/50 border border-accent/20">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {analysis.analysis}
                    </p>
                  </div>
                )}
                <AISuggestionsPanel symbol={`${selectedPair}/USDT`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {openOrders.length > 0 ? (
                  <div className="space-y-3">
                    {openOrders.map((order) => (
                      <div key={order.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={order.order_side === 'buy' ? 'default' : 'destructive'}>
                            {order.order_type} {order.order_side}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {order.base_asset}/{order.quote_asset}
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-mono">{order.amount}</span>
                          </div>
                          {order.price && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Price:</span>
                              <span className="font-mono">${order.price}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {order.order_type === 'limit' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => executeOrder(order.id)}
                            >
                              Execute
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => cancelOrder(order.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
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
