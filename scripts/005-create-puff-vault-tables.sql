-- Create Puff Vault and redemption tables
-- Depends on: 002-create-users-table.sql

CREATE TABLE IF NOT EXISTS puff_vault_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'fee_collection', 'reward_payout')),
  amount DECIMAL(20, 6) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  source TEXT,
  destination TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  transaction_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS puff_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  puff_amount DECIMAL(20, 6) NOT NULL,
  usdc_amount DECIMAL(20, 6) NOT NULL,
  exchange_rate DECIMAL(10, 4) NOT NULL DEFAULT 0.01,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_puff_vault_transactions_type ON puff_vault_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_puff_vault_transactions_created_at ON puff_vault_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_puff_redemptions_user_wallet ON puff_redemptions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_puff_redemptions_status ON puff_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_puff_redemptions_created_at ON puff_redemptions(created_at);

SELECT 'Puff Vault tables created successfully' AS status;
