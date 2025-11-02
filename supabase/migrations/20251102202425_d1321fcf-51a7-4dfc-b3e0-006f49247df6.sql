-- Make agents admin-managed only
DROP POLICY IF EXISTS "Users can view their own agents" ON agents;
DROP POLICY IF EXISTS "Users can manage their own agents" ON agents;

CREATE POLICY "Admins can view all agents"
ON agents
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all agents"
ON agents
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Update agent_performance policies to be admin-viewable
DROP POLICY IF EXISTS "Users can view their agents performance" ON agent_performance;

CREATE POLICY "Admins can view all agent performance"
ON agent_performance
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Insert pre-configured system agents (user_id will be set to first admin user)
-- These agents are ready to be activated by admins
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the first admin user ID
  SELECT user_id INTO admin_user_id
  FROM user_roles
  WHERE role = 'admin'
  LIMIT 1;

  -- Only insert if we have an admin user
  IF admin_user_id IS NOT NULL THEN
    -- Admin Assistant Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Admin Assistant',
      'AI assistant for administrative tasks, system monitoring, and decision support',
      'administrative_support',
      'inactive',
      1,
      ARRAY['BTC/USDT', 'ETH/USDT'],
      1000,
      '{"purpose": "admin_assistance", "capabilities": ["monitoring", "alerts", "reporting", "decision_support"]}'::jsonb
    );

    -- Pool Management Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Pool Manager',
      'Manages liquidity pools, rebalancing, and reserve optimization',
      'pool_management',
      'inactive',
      2,
      ARRAY['BTC/USDT', 'ETH/USDT', 'DEW/USDT'],
      10000,
      '{"purpose": "pool_management", "capabilities": ["liquidity_monitoring", "rebalancing", "reserve_optimization", "pool_analytics"]}'::jsonb
    );

    -- Security Management Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Security Monitor',
      'Monitors security threats, suspicious activities, and implements protective measures',
      'security_monitoring',
      'inactive',
      5,
      ARRAY[]::text[],
      0,
      '{"purpose": "security", "capabilities": ["threat_detection", "anomaly_detection", "alert_generation", "access_monitoring"]}'::jsonb
    );

    -- Multi-DEX Management Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'DEX Aggregator',
      'Manages multi-DEX price discovery and optimal routing',
      'dex_aggregation',
      'inactive',
      3,
      ARRAY['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'],
      5000,
      '{"purpose": "dex_management", "capabilities": ["price_discovery", "route_optimization", "dex_monitoring", "liquidity_analysis"]}'::jsonb
    );

    -- Trading Logic Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Trading Strategist',
      'Core trading logic and strategy execution engine',
      'algorithmic_trading',
      'inactive',
      4,
      ARRAY['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT'],
      7500,
      '{"purpose": "trading_logic", "capabilities": ["strategy_execution", "order_management", "position_tracking", "risk_management"]}'::jsonb
    );

    -- Automation Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Automation Controller',
      'Handles automated workflows, scheduled tasks, and system automation',
      'automation',
      'inactive',
      2,
      ARRAY[]::text[],
      0,
      '{"purpose": "automation", "capabilities": ["workflow_automation", "task_scheduling", "process_optimization", "system_integration"]}'::jsonb
    );

    -- Self-Learning Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Learning Engine',
      'Self-learning AI that adapts strategies based on market data and performance',
      'machine_learning',
      'inactive',
      3,
      ARRAY['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'],
      5000,
      '{"purpose": "self_learning", "capabilities": ["pattern_recognition", "strategy_optimization", "performance_analysis", "adaptive_learning"]}'::jsonb
    );

    -- Data Gathering Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Data Collector',
      'Gathers market data, news, sentiment, and on-chain metrics',
      'data_collection',
      'inactive',
      1,
      ARRAY['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT'],
      0,
      '{"purpose": "data_gathering", "capabilities": ["market_data", "news_aggregation", "sentiment_analysis", "onchain_metrics"]}'::jsonb
    );

    -- Data Processing Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Data Processor',
      'Processes and normalizes raw data for analysis',
      'data_processing',
      'inactive',
      1,
      ARRAY[]::text[],
      0,
      '{"purpose": "data_processing", "capabilities": ["data_cleaning", "normalization", "aggregation", "transformation"]}'::jsonb
    );

    -- Data Analysis Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Data Analyst',
      'Analyzes processed data to generate insights and signals',
      'data_analysis',
      'inactive',
      2,
      ARRAY['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'],
      0,
      '{"purpose": "data_analysis", "capabilities": ["technical_analysis", "fundamental_analysis", "signal_generation", "trend_detection"]}'::jsonb
    );

    -- Backtesting Agent
    INSERT INTO agents (user_id, name, description, strategy, status, risk_level, trading_pairs, max_position_size, config)
    VALUES (
      admin_user_id,
      'Backtest Engine',
      'Evaluates trading strategies using historical data',
      'backtesting',
      'inactive',
      1,
      ARRAY['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT'],
      10000,
      '{"purpose": "backtesting", "capabilities": ["historical_simulation", "performance_metrics", "strategy_validation", "optimization"]}'::jsonb
    );

    -- Initialize performance records for all agents
    INSERT INTO agent_performance (agent_id, total_trades, winning_trades, losing_trades, total_profit, win_rate)
    SELECT id, 0, 0, 0, 0, 0
    FROM agents
    WHERE user_id = admin_user_id
    ON CONFLICT DO NOTHING;
  END IF;
END $$;