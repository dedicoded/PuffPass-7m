-- Enhanced rewards system with merchant-driven catalog and float management

-- Add merchant_id to rewards_catalog for merchant-driven rewards
ALTER TABLE rewards_catalog 
ADD COLUMN IF NOT EXISTS merchant_id TEXT REFERENCES user_profiles(user_id);

-- Create merchant rewards tracking table
CREATE TABLE IF NOT EXISTS merchant_rewards (
  id SERIAL PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES user_profiles(user_id),
  reward_id INTEGER NOT NULL REFERENCES rewards_catalog(id),
  points_allocated INTEGER NOT NULL DEFAULT 0,
  points_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create float management tracking table
CREATE TABLE IF NOT EXISTS float_allocations (
  id SERIAL PRIMARY KEY,
  allocation_type TEXT NOT NULL, -- 'stablecoins', 'fiat_reserves', 'yield_deployment'
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  target_percentage DECIMAL(5,4) NOT NULL DEFAULT 0,
  current_apy DECIMAL(5,4) DEFAULT 0,
  last_rebalance TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default float allocation targets
INSERT INTO float_allocations (allocation_type, target_percentage, current_apy) VALUES
('stablecoins', 0.70, 0.0250),
('fiat_reserves', 0.25, 0.0000),
('yield_deployment', 0.05, 0.0300)
ON CONFLICT DO NOTHING;

-- Create vault contribution tracking for better merchant insights
CREATE TABLE IF NOT EXISTS vault_contribution_metrics (
  id SERIAL PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES user_profiles(user_id),
  contribution_period DATE NOT NULL, -- Monthly tracking
  total_contribution DECIMAL(15,2) NOT NULL DEFAULT 0,
  withdrawal_fees DECIMAL(15,2) NOT NULL DEFAULT 0,
  transaction_fees DECIMAL(15,2) NOT NULL DEFAULT 0,
  estimated_customer_impact INTEGER NOT NULL DEFAULT 0,
  estimated_points_funded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(merchant_id, contribution_period)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchant_rewards_merchant_id ON merchant_rewards(merchant_id);
CREATE INDEX IF NOT EXISTS idx_vault_contribution_metrics_merchant_id ON vault_contribution_metrics(merchant_id);
CREATE INDEX IF NOT EXISTS idx_vault_contribution_metrics_period ON vault_contribution_metrics(contribution_period);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_merchant_id ON rewards_catalog(merchant_id);

-- Add some sample merchant rewards to demonstrate the system
INSERT INTO rewards_catalog (
  merchant_id, name, description, category, points_cost, value_dollars, is_active
) VALUES
(
  (SELECT user_id FROM user_profiles WHERE role = 'merchant' LIMIT 1),
  '10% Off Next Purchase',
  'Get 10% off your next order at our dispensary',
  'discount',
  200,
  5.00,
  true
),
(
  (SELECT user_id FROM user_profiles WHERE role = 'merchant' LIMIT 1),
  'Free Pre-Roll',
  'Complimentary pre-roll with any purchase over $50',
  'product',
  300,
  8.00,
  true
),
(
  (SELECT user_id FROM user_profiles WHERE role = 'merchant' LIMIT 1),
  'VIP Tasting Event',
  'Exclusive invitation to our monthly strain tasting',
  'event',
  500,
  25.00,
  true
)
ON CONFLICT DO NOTHING;

-- Update puff_vault table to ensure proper merchant tracking
ALTER TABLE puff_vault 
ADD COLUMN IF NOT EXISTS fee_type TEXT DEFAULT 'withdrawal_fee';

-- Create a view for easy vault analytics
CREATE OR REPLACE VIEW vault_analytics AS
SELECT 
  DATE_TRUNC('month', timestamp) as month,
  source,
  merchant_id,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount
FROM puff_vault
GROUP BY DATE_TRUNC('month', timestamp), source, merchant_id
ORDER BY month DESC, total_amount DESC;

-- Create a view for merchant contribution leaderboard
CREATE OR REPLACE VIEW merchant_contribution_leaderboard AS
SELECT 
  pv.merchant_id,
  up.email as merchant_email,
  SUM(pv.amount) as total_contribution,
  SUM(CASE WHEN pv.source = 'withdrawal_fee' THEN pv.amount ELSE 0 END) as withdrawal_fees,
  SUM(CASE WHEN pv.source = 'transaction_fee' THEN pv.amount ELSE 0 END) as transaction_fees,
  COUNT(*) as contribution_count,
  MAX(pv.timestamp) as last_contribution,
  -- Estimated impact metrics
  FLOOR(SUM(pv.amount) / 2.5) as estimated_payments_covered,
  FLOOR(SUM(pv.amount) * 0.10 / 0.01) as estimated_points_funded
FROM puff_vault pv
LEFT JOIN user_profiles up ON pv.merchant_id = up.user_id
WHERE pv.merchant_id IS NOT NULL
GROUP BY pv.merchant_id, up.email
ORDER BY total_contribution DESC;

COMMIT;
