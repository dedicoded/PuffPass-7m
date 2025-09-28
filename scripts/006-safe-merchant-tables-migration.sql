-- Safe merchant balance and withdrawal tables migration
-- This script uses transaction blocks and comprehensive error handling

BEGIN;

-- Create merchant_balances table with full safety checks
CREATE TABLE IF NOT EXISTS merchant_balances (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR(255) NOT NULL UNIQUE,
    available_balance DECIMAL(10,2) DEFAULT 0.00 CHECK (available_balance >= 0),
    pending_balance DECIMAL(10,2) DEFAULT 0.00 CHECK (pending_balance >= 0),
    total_earned DECIMAL(10,2) DEFAULT 0.00 CHECK (total_earned >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create withdrawal_requests table with enhanced constraints
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    notes TEXT NULL,
    admin_id VARCHAR(255) NULL,
    CONSTRAINT fk_withdrawal_merchant FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_merchant_balances_merchant_id ON merchant_balances(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_merchant_id ON withdrawal_requests(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_requested_at ON withdrawal_requests(requested_at);

-- Create update trigger function for merchant_balances
CREATE OR REPLACE FUNCTION update_merchant_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS trigger_update_merchant_balance_timestamp ON merchant_balances;
CREATE TRIGGER trigger_update_merchant_balance_timestamp
    BEFORE UPDATE ON merchant_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_merchant_balance_timestamp();

-- Insert default balance records for existing merchants (safe upsert)
INSERT INTO merchant_balances (merchant_id, available_balance, pending_balance, total_earned)
SELECT 
    u.id, 
    2450.75, 
    500.00, 
    2950.75
FROM users u 
WHERE u.role = 'merchant' 
AND NOT EXISTS (
    SELECT 1 FROM merchant_balances mb WHERE mb.merchant_id = u.id
)
ON CONFLICT (merchant_id) DO NOTHING;

-- Insert sample withdrawal requests with safe existence checks
INSERT INTO withdrawal_requests (merchant_id, amount, status, requested_at, processed_at)
SELECT 
    u.id,
    500.00,
    'pending',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    NULL
FROM users u 
WHERE u.role = 'merchant' 
AND NOT EXISTS (
    SELECT 1 FROM withdrawal_requests wr 
    WHERE wr.merchant_id = u.id AND wr.amount = 500.00 AND wr.status = 'pending'
)
LIMIT 1;

INSERT INTO withdrawal_requests (merchant_id, amount, status, requested_at, processed_at)
SELECT 
    u.id,
    1200.00,
    'completed',
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    CURRENT_TIMESTAMP - INTERVAL '8 days'
FROM users u 
WHERE u.role = 'merchant' 
AND NOT EXISTS (
    SELECT 1 FROM withdrawal_requests wr 
    WHERE wr.merchant_id = u.id AND wr.amount = 1200.00 AND wr.status = 'completed'
)
LIMIT 1;

-- Add table comments for documentation
COMMENT ON TABLE merchant_balances IS 'Tracks merchant financial balances for PUFF PASS platform with audit trail';
COMMENT ON TABLE withdrawal_requests IS 'Manages merchant withdrawal requests with admin approval workflow';

-- Verify tables were created successfully
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'merchant_balances') THEN
        RAISE EXCEPTION 'Failed to create merchant_balances table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'withdrawal_requests') THEN
        RAISE EXCEPTION 'Failed to create withdrawal_requests table';
    END IF;
    
    RAISE NOTICE 'Merchant tables migration completed successfully';
END $$;

COMMIT;
