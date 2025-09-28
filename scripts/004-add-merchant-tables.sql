-- Add merchant balance tracking
CREATE TABLE IF NOT EXISTS merchant_balances (
  id SERIAL PRIMARY KEY,
  merchant_id VARCHAR(255) UNIQUE NOT NULL,
  available_balance DECIMAL(10,2) DEFAULT 0.00,
  pending_balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  merchant_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  notes TEXT,
  admin_id VARCHAR(255) NULL
);

-- Add order items table if not exists
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchant_balances_merchant_id ON merchant_balances(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_merchant_id ON withdrawal_requests(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Insert sample data for testing
INSERT INTO merchant_balances (merchant_id, available_balance, pending_balance, total_earned)
VALUES ('sample-merchant-id', 2450.75, 500.00, 5230.50)
ON CONFLICT (merchant_id) DO NOTHING;

INSERT INTO withdrawal_requests (merchant_id, amount, status, requested_at, processed_at)
VALUES 
  ('sample-merchant-id', 500.00, 'pending', '2024-01-15 10:30:00', NULL),
  ('sample-merchant-id', 1200.00, 'completed', '2024-01-10 14:20:00', '2024-01-12 09:15:00')
ON CONFLICT DO NOTHING;
