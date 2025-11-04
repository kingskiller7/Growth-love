-- Create AI suggestions table for storing AI-generated trading recommendations
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('trade', 'portfolio', 'risk', 'market')),
  trading_pair TEXT,
  action TEXT CHECK (action IN ('buy', 'sell', 'hold')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  reasoning TEXT NOT NULL,
  target_price NUMERIC,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_suggestions
CREATE POLICY "Users can view their own AI suggestions"
  ON public.ai_suggestions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create AI suggestions"
  ON public.ai_suggestions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own suggestions"
  ON public.ai_suggestions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create agent_trades table to track automated agent trades
CREATE TABLE IF NOT EXISTS public.agent_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  trading_pair TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('buy', 'sell')),
  amount NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  profit_loss NUMERIC,
  profit_loss_percent NUMERIC,
  execution_time INTEGER, -- milliseconds
  confidence_score INTEGER,
  strategy_used TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_trades ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_trades
CREATE POLICY "Users can view their agent trades"
  ON public.agent_trades
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = agent_trades.agent_id
    AND agents.user_id = auth.uid()
  ));

CREATE POLICY "System can manage agent trades"
  ON public.agent_trades
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create agent_logs table for debugging and monitoring
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  log_level TEXT NOT NULL CHECK (log_level IN ('debug', 'info', 'warning', 'error')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_logs
CREATE POLICY "Admins can view all agent logs"
  ON public.agent_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their agent logs"
  ON public.agent_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = agent_logs.agent_id
    AND agents.user_id = auth.uid()
  ));

CREATE POLICY "System can create agent logs"
  ON public.agent_logs
  FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger for ai_suggestions
CREATE TRIGGER update_ai_suggestions_updated_at
  BEFORE UPDATE ON public.ai_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON public.ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_status ON public.ai_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_expires_at ON public.ai_suggestions(expires_at);
CREATE INDEX IF NOT EXISTS idx_agent_trades_agent_id ON public.agent_trades(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_trades_status ON public.agent_trades(status);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON public.agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON public.agent_logs(created_at DESC);