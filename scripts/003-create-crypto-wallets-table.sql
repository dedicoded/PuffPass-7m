-- Create user_crypto_wallets table for multi-wallet support
-- Depends on: 002-create-users-table.sql

CREATE TABLE IF NOT EXISTS user_crypto_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL DEFAULT 'ethereum' CHECK (wallet_type IN ('ethereum', 'polygon', 'base', 'arbitrum')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(wallet_address, wallet_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_crypto_wallets_user_id ON user_crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crypto_wallets_wallet_address ON user_crypto_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_crypto_wallets_is_primary ON user_crypto_wallets(is_primary) WHERE is_primary = true;

-- Ensure only one primary wallet per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_crypto_wallets_primary_per_user 
  ON user_crypto_wallets(user_id) WHERE is_primary = true;

SELECT 'Crypto wallets table created successfully' AS status;
