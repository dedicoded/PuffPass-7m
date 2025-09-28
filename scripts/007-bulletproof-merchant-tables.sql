-- PUFF PASS Merchant Tables Migration
-- Safe, transactional migration with comprehensive error handling
-- Version: 007 (Bulletproof Edition)

BEGIN;

-- Enable detailed logging
SET client_min_messages = NOTICE;

-- Create merchant_balances table with safety checks
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'merchant_balances') THEN
        CREATE TABLE merchant_balances (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            merchant_id UUID NOT NULL,
            available_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            pending_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            total_earned DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            last_payout_date TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Constraints
            CONSTRAINT merchant_balances_merchant_id_fkey 
                FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT merchant_balances_available_balance_check 
                CHECK (available_balance >= 0),
            CONSTRAINT merchant_balances_pending_balance_check 
                CHECK (pending_balance >= 0),
            CONSTRAINT merchant_balances_total_earned_check 
                CHECK (total_earned >= 0)
        );
        
        RAISE NOTICE 'Created merchant_balances table';
    ELSE
        RAISE NOTICE 'merchant_balances table already exists, skipping creation';
    END IF;
END $$;

-- Create withdrawal_requests table with safety checks
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'withdrawal_requests') THEN
        CREATE TABLE withdrawal_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            merchant_id UUID NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
            bank_details JSONB,
            crypto_address VARCHAR(255),
            requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed_at TIMESTAMP WITH TIME ZONE,
            processed_by UUID,
            notes TEXT,
            transaction_hash VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Constraints
            CONSTRAINT withdrawal_requests_merchant_id_fkey 
                FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT withdrawal_requests_processed_by_fkey 
                FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
            CONSTRAINT withdrawal_requests_amount_check 
                CHECK (amount > 0),
            CONSTRAINT withdrawal_requests_status_check 
                CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled'))
        );
        
        RAISE NOTICE 'Created withdrawal_requests table';
    ELSE
        RAISE NOTICE 'withdrawal_requests table already exists, skipping creation';
    END IF;
END $$;

-- Create performance indexes
DO $$
BEGIN
    -- Index for merchant_balances
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_merchant_balances_merchant_id') THEN
        CREATE INDEX idx_merchant_balances_merchant_id ON merchant_balances(merchant_id);
        RAISE NOTICE 'Created index idx_merchant_balances_merchant_id';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_merchant_balances_updated_at') THEN
        CREATE INDEX idx_merchant_balances_updated_at ON merchant_balances(updated_at);
        RAISE NOTICE 'Created index idx_merchant_balances_updated_at';
    END IF;
    
    -- Index for withdrawal_requests
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_withdrawal_requests_merchant_id') THEN
        CREATE INDEX idx_withdrawal_requests_merchant_id ON withdrawal_requests(merchant_id);
        RAISE NOTICE 'Created index idx_withdrawal_requests_merchant_id';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_withdrawal_requests_status') THEN
        CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
        RAISE NOTICE 'Created index idx_withdrawal_requests_status';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_withdrawal_requests_requested_at') THEN
        CREATE INDEX idx_withdrawal_requests_requested_at ON withdrawal_requests(requested_at);
        RAISE NOTICE 'Created index idx_withdrawal_requests_requested_at';
    END IF;
END $$;

-- Insert sample data for testing (only if tables are empty)
DO $$
DECLARE
    sample_merchant_id UUID;
BEGIN
    -- Get a merchant user ID for sample data
    SELECT id INTO sample_merchant_id 
    FROM users 
    WHERE role = 'merchant' 
    LIMIT 1;
    
    IF sample_merchant_id IS NOT NULL THEN
        -- Insert sample merchant balance if none exists
        IF NOT EXISTS (SELECT 1 FROM merchant_balances WHERE merchant_id = sample_merchant_id) THEN
            INSERT INTO merchant_balances (
                merchant_id, 
                available_balance, 
                pending_balance, 
                total_earned
            ) VALUES (
                sample_merchant_id,
                1250.75,
                350.25,
                2500.00
            );
            RAISE NOTICE 'Inserted sample merchant balance for merchant: %', sample_merchant_id;
        END IF;
        
        -- Insert sample withdrawal requests if none exist
        IF NOT EXISTS (SELECT 1 FROM withdrawal_requests WHERE merchant_id = sample_merchant_id) THEN
            INSERT INTO withdrawal_requests (
                merchant_id,
                amount,
                status,
                payment_method,
                bank_details,
                notes
            ) VALUES 
            (
                sample_merchant_id,
                500.00,
                'pending',
                'bank_transfer',
                '{"bank_name": "Chase Bank", "account_number": "****1234", "routing_number": "021000021"}'::jsonb,
                'Weekly payout request'
            ),
            (
                sample_merchant_id,
                750.00,
                'completed',
                'bank_transfer',
                '{"bank_name": "Chase Bank", "account_number": "****1234", "routing_number": "021000021"}'::jsonb,
                'Previous payout - completed'
            );
            RAISE NOTICE 'Inserted sample withdrawal requests for merchant: %', sample_merchant_id;
        END IF;
    ELSE
        RAISE NOTICE 'No merchant users found, skipping sample data insertion';
    END IF;
END $$;

-- Verification queries
DO $$
DECLARE
    balance_count INTEGER;
    withdrawal_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO balance_count FROM merchant_balances;
    SELECT COUNT(*) INTO withdrawal_count FROM withdrawal_requests;
    
    RAISE NOTICE 'Migration verification:';
    RAISE NOTICE '- merchant_balances records: %', balance_count;
    RAISE NOTICE '- withdrawal_requests records: %', withdrawal_count;
    
    IF balance_count = 0 THEN
        RAISE WARNING 'No merchant balance records found - this may indicate missing merchant users';
    END IF;
END $$;

-- Final success message
RAISE NOTICE 'Migration 007-bulletproof-merchant-tables.sql completed successfully!';

COMMIT;
