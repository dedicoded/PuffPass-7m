-- Create PUFF redemption tracking table
CREATE TABLE IF NOT EXISTS puff_redemptions (
  id SERIAL PRIMARY KEY,
  user_wallet VARCHAR(255) NOT NULL,
  puff_amount DECIMAL(20, 2) NOT NULL,
  usdc_amount DECIMAL(10, 6) NOT NULL,
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_puff_redemptions_user ON puff_redemptions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_puff_redemptions_status ON puff_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_puff_redemptions_created ON puff_redemptions(created_at);

-- Add vault transactions table for tracking funding
CREATE TABLE IF NOT EXISTS puff_vault_transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  amount_usdc DECIMAL(10, 6) NOT NULL,
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vault_transactions_type ON puff_vault_transactions(type);
CREATE INDEX IF NOT EXISTS idx_vault_transactions_created ON puff_vault_transactions(created_at);

-- Add redemption tracking to vault
ALTER TABLE puff_vault 
ADD COLUMN IF NOT EXISTS redemption_reserve DECIMAL(10, 2) DEFAULT 0;

-- Initialize redemption reserve (10% of vault balance)
UPDATE puff_vault 
SET redemption_reserve = amount * 0.10 
WHERE source = 'system_reserve';
