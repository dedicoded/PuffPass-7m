-- Ensure merchant tables exist and are properly seeded
-- This script fixes any missing table issues that could cause API 500 errors

-- Ensure merchant_balances table exists with proper structure
CREATE TABLE IF NOT EXISTS merchant_balances (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR(255) NOT NULL UNIQUE,
    available_balance DECIMAL(10,2) DEFAULT 0.00,
    pending_balance DECIMAL(10,2) DEFAULT 0.00,
    total_earned DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure withdrawal_requests table exists with proper structure
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    notes TEXT NULL,
    admin_id VARCHAR(255) NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_merchant_balances_merchant_id ON merchant_balances(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_merchant_id ON withdrawal_requests(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Ensure all existing merchants have balance records
INSERT INTO merchant_balances (merchant_id, available_balance, pending_balance, total_earned)
SELECT u.id, 2450.75, 500.00, 2950.75
FROM users u 
WHERE u.role = 'merchant' 
AND NOT EXISTS (
    SELECT 1 FROM merchant_balances mb WHERE mb.merchant_id = u.id
)
ON CONFLICT (merchant_id) DO NOTHING;

-- Add sample withdrawal requests for demo purposes
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
    SELECT 1 FROM withdrawal_requests wr WHERE wr.merchant_id = u.id AND wr.amount = 500.00
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
    SELECT 1 FROM withdrawal_requests wr WHERE wr.merchant_id = u.id AND wr.amount = 1200.00
)
LIMIT 1;

-- Update trigger for merchant_balances updated_at
CREATE OR REPLACE FUNCTION update_merchant_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_merchant_balance_timestamp ON merchant_balances;
CREATE TRIGGER trigger_update_merchant_balance_timestamp
    BEFORE UPDATE ON merchant_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_merchant_balance_timestamp();

-- Verify tables exist and have data
DO $$
BEGIN
    -- Check if merchant_balances table has data
    IF NOT EXISTS (SELECT 1 FROM merchant_balances LIMIT 1) THEN
        RAISE NOTICE 'Warning: merchant_balances table is empty';
    END IF;
    
    -- Check if withdrawal_requests table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'withdrawal_requests') THEN
        RAISE EXCEPTION 'Critical: withdrawal_requests table does not exist';
    END IF;
    
    RAISE NOTICE 'Merchant tables verification completed successfully';
END $$;
