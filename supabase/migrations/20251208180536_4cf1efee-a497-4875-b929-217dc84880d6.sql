-- Add wallet_addresses table for blockchain wallet management
CREATE TABLE public.wallet_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  private_key_encrypted TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chain, is_primary)
);

-- Enable RLS
ALTER TABLE public.wallet_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only view their own wallet addresses
CREATE POLICY "Users can view their own wallets"
ON public.wallet_addresses FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own wallets
CREATE POLICY "Users can create their own wallets"
ON public.wallet_addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own wallets
CREATE POLICY "Users can update their own wallets"
ON public.wallet_addresses FOR UPDATE
USING (auth.uid() = user_id);

-- Add token_supply_control table for DEW token supply management
CREATE TABLE public.token_supply_control (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('mint', 'burn', 'transfer')),
  amount NUMERIC NOT NULL,
  reason TEXT,
  pool_id UUID REFERENCES public.pools(id),
  executed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_supply_control ENABLE ROW LEVEL SECURITY;

-- Only admins can manage token supply
CREATE POLICY "Admins can manage token supply"
ON public.token_supply_control FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can view token supply history
CREATE POLICY "Anyone can view token supply history"
ON public.token_supply_control FOR SELECT
USING (true);

-- Add current_supply column to pools table
ALTER TABLE public.pools 
ADD COLUMN IF NOT EXISTS current_supply NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_supply NUMERIC DEFAULT 1000000000,
ADD COLUMN IF NOT EXISTS circulating_supply NUMERIC DEFAULT 0;