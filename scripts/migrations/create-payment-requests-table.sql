-- Create payment_requests table for shareable payment links

CREATE TABLE IF NOT EXISTS payment_requests (
  id VARCHAR(255) PRIMARY KEY,
  merchant_address VARCHAR(255) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USDC',
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  transaction_hash VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for merchant lookups
CREATE INDEX IF NOT EXISTS idx_payment_requests_merchant 
ON payment_requests(merchant_address);

-- Create index for status lookups
CREATE INDEX IF NOT EXISTS idx_payment_requests_status 
ON payment_requests(status);

-- Create index for expiration checks
CREATE INDEX IF NOT EXISTS idx_payment_requests_expires 
ON payment_requests(expires_at);

-- Add comment
COMMENT ON TABLE payment_requests IS 'Stores shareable payment request links and QR codes';
