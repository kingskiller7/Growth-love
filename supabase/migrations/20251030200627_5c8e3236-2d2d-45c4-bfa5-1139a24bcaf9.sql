-- Create market prices table for real-time price updates
CREATE TABLE IF NOT EXISTS public.market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT UNIQUE NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  change_24h DECIMAL(20, 8),
  change_24h_percent DECIMAL(10, 4),
  volume_24h DECIMAL(20, 2),
  market_cap DECIMAL(20, 2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on symbol for fast lookups
CREATE INDEX IF NOT EXISTS idx_market_prices_symbol ON public.market_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_market_prices_last_updated ON public.market_prices(last_updated);

-- Enable RLS
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read market prices (public data)
CREATE POLICY "Market prices are viewable by everyone"
  ON public.market_prices
  FOR SELECT
  USING (true);

-- Create notifications table for push notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'trade', 'agent', 'security')),
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Add trigger to update market prices timestamp
CREATE OR REPLACE FUNCTION update_market_price_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_market_prices_timestamp
  BEFORE UPDATE ON public.market_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_market_price_timestamp();

-- Enable realtime for market prices
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_prices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;