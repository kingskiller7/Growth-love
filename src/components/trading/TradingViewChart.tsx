import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, BarChart3, CandlestickChart } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  height?: number;
}

type ChartType = 'candles' | 'line' | 'bars';
type Interval = '1' | '5' | '15' | '60' | 'D' | 'W';

export function TradingViewChart({ symbol, height = 400 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [interval, setInterval] = useState<Interval>('15');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    setLoading(true);
    setError(null);

    // Clean up previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && containerRef.current) {
        try {
          new (window as any).TradingView.widget({
            autosize: true,
            symbol: `BINANCE:${symbol}USDT`,
            interval: interval,
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: chartType === 'candles' ? '1' : chartType === 'line' ? '2' : '0',
            locale: 'en',
            toolbar_bg: '#0a0a0a',
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: 'tradingview_chart',
            hide_side_toolbar: false,
            studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
          });
          setLoading(false);
        } catch (err) {
          setError('Failed to load chart');
          setLoading(false);
        }
      }
    };
    script.onerror = () => {
      setError('Failed to load TradingView');
      setLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, chartType, interval]);

  const intervals: { value: Interval; label: string }[] = [
    { value: '1', label: '1m' },
    { value: '5', label: '5m' },
    { value: '15', label: '15m' },
    { value: '60', label: '1H' },
    { value: 'D', label: '1D' },
    { value: 'W', label: '1W' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {symbol}/USDT Chart
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={chartType === 'candles' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('candles')}
                className="h-7 px-2"
              >
                <CandlestickChart className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-7 px-2"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'bars' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bars')}
                className="h-7 px-2"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {intervals.map((i) => (
                <Button
                  key={i.value}
                  variant={interval === i.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setInterval(i.value)}
                  className="h-7 px-2 text-xs"
                >
                  {i.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <p className="text-destructive">{error}</p>
            </div>
          )}
          <div 
            id="tradingview_chart" 
            ref={containerRef} 
            className="w-full h-full rounded-lg overflow-hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}