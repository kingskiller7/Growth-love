-- Create algorithms table for trading algorithms
CREATE TABLE IF NOT EXISTS public.algorithms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'system' or 'custom'
  roi NUMERIC DEFAULT 0,
  success_ratio NUMERIC DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  avg_profit_per_trade NUMERIC DEFAULT 0,
  risk_level INTEGER CHECK (risk_level >= 1 AND risk_level <= 5),
  status TEXT NOT NULL DEFAULT 'pending', -- 'active', 'pending', 'approved', 'rejected'
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  is_system BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_algorithms junction table for user algo selections
CREATE TABLE IF NOT EXISTS public.user_algorithms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  algorithm_id UUID NOT NULL REFERENCES public.algorithms(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, algorithm_id)
);

-- Enable RLS
ALTER TABLE public.algorithms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_algorithms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for algorithms
CREATE POLICY "Anyone can view active system algorithms"
  ON public.algorithms FOR SELECT
  USING (is_system = true AND status = 'active');

CREATE POLICY "Users can view their own custom algorithms"
  ON public.algorithms FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create custom algorithms"
  ON public.algorithms FOR INSERT
  WITH CHECK (created_by = auth.uid() AND is_system = false);

CREATE POLICY "Admins can manage all algorithms"
  ON public.algorithms FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_algorithms
CREATE POLICY "Users can view their own algorithm selections"
  ON public.user_algorithms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own algorithm selections"
  ON public.user_algorithms FOR ALL
  USING (auth.uid() = user_id);

-- Insert system algorithms
INSERT INTO public.algorithms (name, description, category, roi, success_ratio, win_rate, total_trades, avg_profit_per_trade, risk_level, status, is_system, config) VALUES
('Momentum Scalper', 'High-frequency trading based on short-term price momentum. Executes rapid trades to capture small price movements.', 'system', 12.5, 0.68, 0.72, 1547, 8.50, 4, 'active', true, '{"timeframe": "1m", "indicators": ["RSI", "MACD"], "max_position": 1000}'::jsonb),
('Trend Follower', 'Identifies and follows strong market trends using moving averages and trend indicators for medium-term positions.', 'system', 18.3, 0.75, 0.71, 892, 22.30, 3, 'active', true, '{"timeframe": "15m", "indicators": ["EMA", "ADX"], "max_position": 5000}'::jsonb),
('Mean Reversion', 'Exploits price reversals by buying oversold assets and selling overbought ones. Works best in ranging markets.', 'system', 15.7, 0.71, 0.69, 1203, 14.80, 3, 'active', true, '{"timeframe": "5m", "indicators": ["BB", "RSI"], "max_position": 2500}'::jsonb),
('Arbitrage Hunter', 'Captures price differences across multiple DEXs for risk-free profits. Requires fast execution and low fees.', 'system', 8.2, 0.92, 0.94, 3421, 3.20, 1, 'active', true, '{"dexs": ["uniswap", "sushiswap", "pancakeswap"], "min_profit": 0.5}'::jsonb),
('Grid Trading Bot', 'Places multiple buy and sell orders at predetermined intervals to profit from market volatility.', 'system', 14.1, 0.78, 0.76, 2156, 7.90, 2, 'active', true, '{"grid_levels": 10, "price_range": 5, "max_position": 3000}'::jsonb),
('Breakout Catcher', 'Identifies and trades breakouts from consolidation patterns. Enters positions when price breaks key levels.', 'system', 21.4, 0.64, 0.67, 654, 35.70, 5, 'active', true, '{"timeframe": "1h", "indicators": ["Volume", "ATR"], "max_position": 8000}'::jsonb),
('DCA Accumulator', 'Dollar-Cost Averaging strategy that systematically accumulates assets over time regardless of price.', 'system', 9.8, 0.88, 0.85, 445, 25.10, 1, 'active', true, '{"interval": "daily", "amount": 100, "assets": ["BTC", "ETH"]}'::jsonb),
('Volatility Rider', 'Profits from high volatility periods by dynamically adjusting position sizes and using protective stops.', 'system', 19.6, 0.69, 0.73, 1089, 19.40, 4, 'active', true, '{"timeframe": "30m", "indicators": ["ATR", "BB"], "max_position": 6000}'::jsonb);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_algorithms_updated_at
    BEFORE UPDATE ON public.algorithms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();