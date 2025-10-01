-- Updated to use UUID types to match actual users table schema
-- Create transactions table for payment processing
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('cybrid','sphere','applepay','cashapp','zelle','venmo','bank')),
    provider_txn_id TEXT NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending','confirmed','failed','cancelled')),
    type VARCHAR(50) NOT NULL DEFAULT 'fiat_onramp', -- 'fiat_onramp', 'purchase', 'withdrawal'
    amount_usd DECIMAL(10, 2),
    amount_puff DECIMAL(10, 2),
    payment_method VARCHAR(100), -- 'cybrid', 'sphere', 'bank_transfer', etc.
    external_transaction_id VARCHAR(255), -- Generic field for external payment IDs
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add puff_balance column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS puff_balance DECIMAL(10, 2) DEFAULT 0.00;

-- Updated indexes to use UUID and new column names
-- Prevent duplicate provider transaction IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_provider_txn
    ON transactions(provider, provider_txn_id);

-- Fast lookups by user
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);

-- Updated trigger function and trigger names to avoid conflicts
-- Auto-update timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'set_transactions_updated_at'
   ) THEN
      CREATE TRIGGER set_transactions_updated_at
      BEFORE UPDATE ON transactions
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
   END IF;
END$$;
