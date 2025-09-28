-- Create Puff Vault system tables for fee collection and treasury management

-- Puff Vault table to track all fee revenue
CREATE TABLE IF NOT EXISTS puff_vault (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL, -- 'withdrawal_fee', 'transaction_fee', etc.
  amount DECIMAL(10, 2) NOT NULL,
  merchant_id VARCHAR(255), -- optional, for tracking source merchant
  transaction_id VARCHAR(255), -- optional, for linking to specific transactions
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced withdrawal requests table with fee tracking
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS destination VARCHAR(20) DEFAULT 'ACH',
ADD COLUMN IF NOT EXISTS fee_rate DECIMAL(5, 4) DEFAULT 0.07;

-- Update existing withdrawal requests to have fee calculations
UPDATE withdrawal_requests 
SET 
  fee_rate = 0.07,
  fee_amount = amount * 0.07,
  net_amount = amount * 0.93
WHERE fee_amount IS NULL OR fee_amount = 0;

-- Consumer payment transactions table for fee-free tracking
CREATE TABLE IF NOT EXISTS consumer_transactions (
  id SERIAL PRIMARY KEY,
  consumer_id VARCHAR(255) NOT NULL,
  merchant_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  fee_covered_by_merchant BOOLEAN DEFAULT true,
  transaction_type VARCHAR(20) DEFAULT 'payment', -- 'payment', 'transfer', 'onramp'
  description TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchant fee tracking for transparency
CREATE TABLE IF NOT EXISTS merchant_fees (
  id SERIAL PRIMARY KEY,
  merchant_id VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255),
  fee_type VARCHAR(30) NOT NULL, -- 'payment_processing', 'withdrawal', 'monthly'
  fee_amount DECIMAL(10, 2) NOT NULL,
  fee_rate DECIMAL(5, 4),
  base_amount DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial Puff Vault data
INSERT INTO puff_vault (source, amount, description) VALUES
('withdrawal_fee', 156.75, 'Accumulated withdrawal fees from merchant payouts'),
('system_reserve', 5000.00, 'Initial treasury reserve for fee-free consumer payments'),
('transaction_fees', 89.32, 'Processing fees from merchant transactions');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_puff_vault_source ON puff_vault(source);
CREATE INDEX IF NOT EXISTS idx_puff_vault_timestamp ON puff_vault(timestamp);
CREATE INDEX IF NOT EXISTS idx_consumer_transactions_consumer ON consumer_transactions(consumer_id);
CREATE INDEX IF NOT EXISTS idx_consumer_transactions_merchant ON consumer_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_fees_merchant ON merchant_fees(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_fees_type ON merchant_fees(fee_type);
