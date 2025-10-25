-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'trade', 'conversion', 'fee');

-- Create enum for transaction status
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Create enum for order types
CREATE TYPE public.order_type AS ENUM ('market', 'limit', 'stop');

-- Create enum for order side
CREATE TYPE public.order_side AS ENUM ('buy', 'sell');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('open', 'filled', 'partially_filled', 'cancelled', 'rejected');

-- Create enum for agent status
CREATE TYPE public.agent_status AS ENUM ('active', 'inactive', 'paused', 'error');

-- Create enum for proposal status
CREATE TYPE public.proposal_status AS ENUM ('active', 'passed', 'rejected', 'executed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  country TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  kyc_verified BOOLEAN DEFAULT false,
  kyc_verified_at TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT false,
  biometric_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_value DECIMAL(20, 8) NOT NULL DEFAULT 0,
  total_value_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  change_24h DECIMAL(10, 2) DEFAULT 0,
  change_24h_percent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create holdings table
CREATE TABLE public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  asset_symbol TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  average_buy_price DECIMAL(20, 8),
  current_price DECIMAL(20, 8),
  value_usd DECIMAL(20, 2),
  change_24h DECIMAL(10, 2),
  change_24h_percent DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portfolio_id, asset_symbol)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  asset_symbol TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  amount_usd DECIMAL(20, 2),
  fee DECIMAL(20, 8) DEFAULT 0,
  fee_usd DECIMAL(20, 2) DEFAULT 0,
  status transaction_status NOT NULL DEFAULT 'pending',
  from_address TEXT,
  to_address TEXT,
  transaction_hash TEXT,
  network TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_type order_type NOT NULL,
  order_side order_side NOT NULL,
  base_asset TEXT NOT NULL,
  quote_asset TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  filled_amount DECIMAL(20, 8) DEFAULT 0,
  price DECIMAL(20, 8),
  stop_price DECIMAL(20, 8),
  status order_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  filled_at TIMESTAMPTZ
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status agent_status NOT NULL DEFAULT 'inactive',
  strategy TEXT,
  risk_level INTEGER CHECK (risk_level >= 1 AND risk_level <= 10),
  max_position_size DECIMAL(20, 8),
  trading_pairs TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- Create agent_performance table
CREATE TABLE public.agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  total_profit DECIMAL(20, 8) DEFAULT 0,
  total_profit_usd DECIMAL(20, 2) DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  avg_profit_per_trade DECIMAL(20, 8) DEFAULT 0,
  max_drawdown DECIMAL(10, 2) DEFAULT 0,
  sharpe_ratio DECIMAL(10, 4),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pools table
CREATE TABLE public.pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_number INTEGER NOT NULL CHECK (pool_number IN (1, 2)),
  name TEXT NOT NULL,
  description TEXT,
  total_liquidity DECIMAL(20, 8) NOT NULL DEFAULT 0,
  total_liquidity_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  reserve_ratio DECIMAL(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pool_number)
);

-- Create pool_transactions table
CREATE TABLE public.pool_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  amount_usd DECIMAL(20, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create dew_tokens table
CREATE TABLE public.dew_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
  total_earned DECIMAL(20, 8) DEFAULT 0,
  total_spent DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create governance_proposals table
CREATE TABLE public.governance_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status proposal_status NOT NULL DEFAULT 'active',
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  quorum_required INTEGER NOT NULL,
  voting_ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- Create proposal_votes table
CREATE TABLE public.proposal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.governance_proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_weight INTEGER NOT NULL,
  vote_for BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dew_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_votes ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for portfolios
CREATE POLICY "Users can view their own portfolio"
  ON public.portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio"
  ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for holdings
CREATE POLICY "Users can view their own holdings"
  ON public.holdings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own holdings"
  ON public.holdings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for agents
CREATE POLICY "Users can view their own agents"
  ON public.agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own agents"
  ON public.agents FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for agent_performance
CREATE POLICY "Users can view their agents performance"
  ON public.agent_performance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_performance.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- RLS Policies for pools (public read, admin write)
CREATE POLICY "Anyone can view pools"
  ON public.pools FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pools"
  ON public.pools FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for pool_transactions (public read, admin write)
CREATE POLICY "Anyone can view pool transactions"
  ON public.pool_transactions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pool transactions"
  ON public.pool_transactions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for dew_tokens
CREATE POLICY "Users can view their own DEW balance"
  ON public.dew_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own DEW balance"
  ON public.dew_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DEW balance"
  ON public.dew_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for governance_proposals (public read, authenticated create)
CREATE POLICY "Anyone can view proposals"
  ON public.governance_proposals FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create proposals"
  ON public.governance_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

CREATE POLICY "Admins can manage proposals"
  ON public.governance_proposals FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for proposal_votes
CREATE POLICY "Users can view all votes"
  ON public.proposal_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create votes"
  ON public.proposal_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at
  BEFORE UPDATE ON public.holdings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pools_updated_at
  BEFORE UPDATE ON public.pools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dew_tokens_updated_at
  BEFORE UPDATE ON public.dew_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create portfolio
  INSERT INTO public.portfolios (user_id)
  VALUES (NEW.id);
  
  -- Create DEW token balance
  INSERT INTO public.dew_tokens (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_holdings_portfolio_id ON public.holdings(portfolio_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agent_performance_agent_id ON public.agent_performance(agent_id);
CREATE INDEX idx_pool_transactions_pool_id ON public.pool_transactions(pool_id);
CREATE INDEX idx_dew_tokens_user_id ON public.dew_tokens(user_id);
CREATE INDEX idx_governance_proposals_status ON public.governance_proposals(status);
CREATE INDEX idx_proposal_votes_proposal_id ON public.proposal_votes(proposal_id);

-- Insert initial pool data
INSERT INTO public.pools (pool_number, name, description)
VALUES 
  (1, 'DEW Token Pool', 'Primary pool for DEW token management and issuance'),
  (2, 'Multi-Currency Reserve Pool', 'Pool for multi-cryptocurrency reserves and liquidity');
