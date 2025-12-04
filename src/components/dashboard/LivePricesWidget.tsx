import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealtimePrices } from "@/hooks/useRealtimePrices";
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react";

export function LivePricesWidget() {
  const { prices, connected, loading } = useRealtimePrices();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2 p-4 sm:p-6">
          <CardTitle className="text-lg flex items-center gap-2">
            Live Prices
            <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-2 sm:p-3 rounded-lg bg-muted/30 animate-pulse">
                <div className="h-4 w-12 bg-muted rounded mb-2" />
                <div className="h-6 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Live Market Prices
            {connected ? (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-destructive" />
            )}
          </CardTitle>
          <Badge variant="outline" className={connected ? 'border-primary text-primary' : 'border-destructive text-destructive'}>
            {connected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {connected ? 'Live' : 'Offline'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {prices.slice(0, 5).map((price) => {
            const isPositive = price.change_24h >= 0;
            return (
              <div 
                key={price.symbol} 
                className="p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{price.symbol}</span>
                  <span className={`text-[10px] sm:text-xs flex items-center ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                    {isPositive ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
                    {isPositive ? '+' : ''}{price.change_24h?.toFixed(1)}%
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold font-mono">
                  ${price.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
