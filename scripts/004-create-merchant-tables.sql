-- Create merchant-related tables
-- Depends on: 002-create-users-table.sql

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  license_number TEXT,
  wallet_address TEXT NOT NULL,
  balance DECIMAL(20, 6) DEFAULT 0,
  total_sales DECIMAL(20, 6) DEFAULT 0,
  total_fees_paid DECIMAL(20, 6) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id),
  UNIQUE(wallet_address)
);

CREATE TABLE IF NOT EXISTS merchant_withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount DECIMAL(20, 6) NOT NULL,
  fee DECIMAL(20, 6) NOT NULL,
  net_amount DECIMAL(20, 6) NOT NULL,
  withdrawal_type TEXT NOT NULL CHECK (withdrawal_type IN ('instant', 'delayed')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES users(id),
  transaction_hash TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_wallet_address ON merchants(wallet_address);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchant_withdrawals_merchant_id ON merchant_withdrawals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_withdrawals_status ON merchant_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_merchant_withdrawals_requested_at ON merchant_withdrawals(requested_at);

SELECT 'Merchant tables created successfully' AS status;
