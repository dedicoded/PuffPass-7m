-- Create crypto_payments table for XAIGATE integration
CREATE TABLE IF NOT EXISTS crypto_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USDC',
  network VARCHAR(50) NOT NULL DEFAULT 'solana',
  address VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  tx_hash VARCHAR(255),
  confirmations INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_crypto_payments_payment_id ON crypto_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_user_id ON crypto_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_order_id ON crypto_payments(order_id);

-- Add comment
COMMENT ON TABLE crypto_payments IS 'XAIGATE crypto payment transactions for Puff Pass';
