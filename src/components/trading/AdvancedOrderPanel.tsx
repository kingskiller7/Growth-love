import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingDown, TrendingUp, AlertTriangle, 
  Layers, Percent, Loader2, Info 
} from "lucide-react";
import { useAdvancedOrders } from "@/hooks/useAdvancedOrders";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AdvancedOrderPanelProps {
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
}

export function AdvancedOrderPanel({ baseAsset, quoteAsset, currentPrice }: AdvancedOrderPanelProps) {
  const { loading, createTrailingStopOrder, createOCOOrder, createMarginOrder } = useAdvancedOrders();
  
  // Trailing Stop state
  const [trailingPercent, setTrailingPercent] = useState(5);
  const [trailingAmount, setTrailingAmount] = useState("");
  const [trailingSide, setTrailingSide] = useState<'buy' | 'sell'>('sell');
  
  // OCO state
  const [ocoLimitPrice, setOcoLimitPrice] = useState("");
  const [ocoStopPrice, setOcoStopPrice] = useState("");
  const [ocoAmount, setOcoAmount] = useState("");
  const [ocoSide, setOcoSide] = useState<'buy' | 'sell'>('sell');
  
  // Margin state
  const [leverage, setLeverage] = useState([2]);
  const [marginAmount, setMarginAmount] = useState("");
  const [marginPrice, setMarginPrice] = useState("");
  const [marginSide, setMarginSide] = useState<'buy' | 'sell'>('buy');
  const [marginOrderType, setMarginOrderType] = useState<'market' | 'limit'>('market');

  const handleTrailingStopOrder = async () => {
    if (!trailingAmount || parseFloat(trailingAmount) <= 0) return;
    
    await createTrailingStopOrder({
      baseAsset,
      quoteAsset,
      amount: parseFloat(trailingAmount),
      trailingPercent,
      orderSide: trailingSide,
    });
    
    setTrailingAmount("");
  };

  const handleOCOOrder = async () => {
    if (!ocoAmount || !ocoLimitPrice || !ocoStopPrice) return;
    
    await createOCOOrder({
      baseAsset,
      quoteAsset,
      amount: parseFloat(ocoAmount),
      limitPrice: parseFloat(ocoLimitPrice),
      stopPrice: parseFloat(ocoStopPrice),
      orderSide: ocoSide,
    });
    
    setOcoAmount("");
    setOcoLimitPrice("");
    setOcoStopPrice("");
  };

  const handleMarginOrder = async () => {
    if (!marginAmount || parseFloat(marginAmount) <= 0) return;
    
    await createMarginOrder({
      baseAsset,
      quoteAsset,
      amount: parseFloat(marginAmount),
      leverage: leverage[0],
      orderSide: marginSide,
      orderType: marginOrderType,
      price: marginPrice ? parseFloat(marginPrice) : currentPrice,
    });
    
    setMarginAmount("");
    setMarginPrice("");
  };

  const calculateTrailingStopPrice = () => {
    if (trailingSide === 'sell') {
      return currentPrice * (1 - trailingPercent / 100);
    }
    return currentPrice * (1 + trailingPercent / 100);
  };

  const calculateLiquidationPrice = () => {
    const price = marginPrice ? parseFloat(marginPrice) : currentPrice;
    const maintenanceMargin = 0.05;
    if (marginSide === 'buy') {
      return price * (1 - (1 / leverage[0]) + maintenanceMargin);
    }
    return price * (1 + (1 / leverage[0]) - maintenanceMargin);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Advanced Orders
        </CardTitle>
        <CardDescription>Trailing stops, OCO orders, and margin trading</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trailing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trailing" className="text-xs sm:text-sm">
              <TrendingDown className="h-3 w-3 mr-1 hidden sm:inline" />
              Trailing
            </TabsTrigger>
            <TabsTrigger value="oco" className="text-xs sm:text-sm">
              <Layers className="h-3 w-3 mr-1 hidden sm:inline" />
              OCO
            </TabsTrigger>
            <TabsTrigger value="margin" className="text-xs sm:text-sm">
              <Percent className="h-3 w-3 mr-1 hidden sm:inline" />
              Margin
            </TabsTrigger>
          </TabsList>

          {/* Trailing Stop Tab */}
          <TabsContent value="trailing" className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  A trailing stop adjusts automatically as the price moves in your favor, 
                  locking in profits while limiting downside.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Side</Label>
              <Select value={trailingSide} onValueChange={(v: 'buy' | 'sell') => setTrailingSide(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">Sell (Protect Long)</SelectItem>
                  <SelectItem value="buy">Buy (Protect Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Trailing Distance</Label>
                <Badge variant="outline">{trailingPercent}%</Badge>
              </div>
              <Slider
                value={[trailingPercent]}
                onValueChange={(v) => setTrailingPercent(v[0])}
                min={1}
                max={20}
                step={0.5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount ({baseAsset})</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={trailingAmount}
                onChange={(e) => setTrailingAmount(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Price:</span>
                <span className="font-mono">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Initial Stop:</span>
                <span className="font-mono text-warning">${calculateTrailingStopPrice().toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleTrailingStopOrder}
              disabled={loading || !trailingAmount || parseFloat(trailingAmount) <= 0}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Create Trailing Stop
                </>
              )}
            </Button>
          </TabsContent>

          {/* OCO Tab */}
          <TabsContent value="oco" className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  One-Cancels-Other: Place both a limit and stop order. 
                  When one executes, the other is automatically cancelled.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Side</Label>
              <Select value={ocoSide} onValueChange={(v: 'buy' | 'sell') => setOcoSide(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  Limit Price
                </Label>
                <Input
                  type="number"
                  placeholder={currentPrice.toFixed(2)}
                  value={ocoLimitPrice}
                  onChange={(e) => setOcoLimitPrice(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  Stop Price
                </Label>
                <Input
                  type="number"
                  placeholder={currentPrice.toFixed(2)}
                  value={ocoStopPrice}
                  onChange={(e) => setOcoStopPrice(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount ({baseAsset})</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={ocoAmount}
                onChange={(e) => setOcoAmount(e.target.value)}
                className="font-mono"
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleOCOOrder}
              disabled={loading || !ocoAmount || !ocoLimitPrice || !ocoStopPrice}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <Layers className="h-4 w-4 mr-2" />
                  Create OCO Order
                </>
              )}
            </Button>
          </TabsContent>

          {/* Margin Tab */}
          <TabsContent value="margin" className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  Margin trading involves high risk. You can lose more than your initial investment. 
                  Only trade with funds you can afford to lose.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Leverage
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Higher leverage increases both potential profit and risk. 
                        Maximum 10x leverage allowed.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Badge variant={leverage[0] >= 5 ? "destructive" : "default"}>
                  {leverage[0]}x
                </Badge>
              </div>
              <Slider
                value={leverage}
                onValueChange={setLeverage}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Side</Label>
                <Select value={marginSide} onValueChange={(v: 'buy' | 'sell') => setMarginSide(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Long</SelectItem>
                    <SelectItem value="sell">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={marginOrderType} onValueChange={(v: 'market' | 'limit') => setMarginOrderType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {marginOrderType === 'limit' && (
              <div className="space-y-2">
                <Label>Price ({quoteAsset})</Label>
                <Input
                  type="number"
                  placeholder={currentPrice.toFixed(2)}
                  value={marginPrice}
                  onChange={(e) => setMarginPrice(e.target.value)}
                  className="font-mono"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount ({baseAsset})</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={marginAmount}
                onChange={(e) => setMarginAmount(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Position Size:</span>
                <span className="font-mono">
                  {marginAmount ? (parseFloat(marginAmount) * leverage[0]).toFixed(4) : '0'} {baseAsset}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Required Margin:</span>
                <span className="font-mono">
                  ${marginAmount && currentPrice ? ((parseFloat(marginAmount) * currentPrice) / leverage[0]).toFixed(2) : '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Liquidation Price:</span>
                <span className="font-mono text-destructive">
                  ${marginAmount ? calculateLiquidationPrice().toFixed(2) : '0'}
                </span>
              </div>
            </div>

            <Button 
              className="w-full" 
              variant={marginSide === 'buy' ? 'default' : 'destructive'}
              onClick={handleMarginOrder}
              disabled={loading || !marginAmount || parseFloat(marginAmount) <= 0}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <Percent className="h-4 w-4 mr-2" />
                  {marginSide === 'buy' ? 'Open Long' : 'Open Short'} {leverage[0]}x
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
