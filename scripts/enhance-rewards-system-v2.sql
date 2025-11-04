-- Enhanced rewards system with merchant-driven catalog and float management
-- Fixed foreign key references and made script idempotent

-- Add merchant_id to rewards_catalog for merchant-driven rewards
ALTER TABLE rewards_catalog 
ADD COLUMN IF NOT EXISTS merchant_id UUID;

-- Drop existing foreign key if it exists before creating new one
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'merchant_rewards_reward_id_fkey'
  ) THEN
    -- Create merchant rewards tracking table only if foreign key doesn't exist
    CREATE TABLE IF NOT EXISTS merchant_rewards (
      id SERIAL PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      reward_id UUID NOT NULL REFERENCES rewards_catalog(id),
      points_allocated INTEGER NOT NULL DEFAULT 0,
      points_redeemed INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  END IF;
END $$;

-- Create float management tracking table
CREATE TABLE IF NOT EXISTS float_allocations_v2 (
  id SERIAL PRIMARY KEY,
  allocation_type TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  target_percentage DECIMAL(5,4) NOT NULL DEFAULT 0,
  current_apy DECIMAL(5,4) DEFAULT 0,
  last_rebalance TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default float allocation targets
INSERT INTO float_allocations_v2 (allocation_type, target_percentage, current_apy) VALUES
('stablecoins', 0.70, 0.0250),
('fiat_reserves', 0.25, 0.0000),
('yield_deployment', 0.05, 0.0300)
ON CONFLICT DO NOTHING;

-- Create vault contribution tracking for better merchant insights
CREATE TABLE IF NOT EXISTS vault_contribution_metrics (
  id SERIAL PRIMARY KEY,
  merchant_id TEXT NOT NULL,
  contribution_period DATE NOT NULL,
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
  (SELECT id FROM merchant_profiles LIMIT 1),
  '10% Off Next Purchase',
  'Get 10% off your next order at our dispensary',
  'discount',
  200,
  5.00,
  true
),
(
  (SELECT id FROM merchant_profiles LIMIT 1),
  'Free Pre-Roll',
  'Complimentary pre-roll with any purchase over $50',
  'product',
  300,
  8.00,
  true
),
(
  (SELECT id FROM merchant_profiles LIMIT 1),
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
  DATE_TRUNC('month', created_at) as month,
  source,
  merchant_id,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount
FROM puff_vault
GROUP BY DATE_TRUNC('month', created_at), source, merchant_id
ORDER BY month DESC, total_amount DESC;

-- Create a view for merchant contribution leaderboard
CREATE OR REPLACE VIEW merchant_contribution_leaderboard AS
SELECT 
  pv.merchant_id,
  mp.email as merchant_email,
  SUM(pv.amount) as total_contribution,
  COUNT(*) as contribution_count,
  MAX(pv.created_at) as last_contribution,
  FLOOR(SUM(pv.amount) / 2.5) as estimated_payments_covered,
  FLOOR(SUM(pv.amount) * 0.10 / 0.01) as estimated_points_funded
FROM puff_vault pv
LEFT JOIN merchant_profiles mp ON pv.merchant_id::uuid = mp.id
WHERE pv.merchant_id IS NOT NULL
GROUP BY pv.merchant_id, mp.email
ORDER BY total_contribution DESC;
