-- ============================
-- Migrate existing wallet addresses from users table to user_crypto_wallets
-- Idempotent data migration
-- ============================

-- Added check to ensure user_crypto_wallets table exists before migration
-- Ensure the user_crypto_wallets table exists (in case this script runs before 05)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_crypto_wallets') THEN
        RAISE EXCEPTION 'user_crypto_wallets table does not exist. Please run 05-add-crypto-integration-tables.sql first.';
    END IF;
END $$;

-- Copy existing wallet addresses from users table to user_crypto_wallets
-- Only insert if the address doesn't already exist to avoid duplicates
INSERT INTO user_crypto_wallets (user_id, address, type, trusted, created_at)
SELECT 
    u.id as user_id,
    u.wallet_address as address,
    'metamask' as type,  -- Default type, can be updated later
    false as trusted,    -- Default to untrusted, can be updated later
    u.created_at
FROM users u
WHERE u.wallet_address IS NOT NULL 
  AND u.wallet_address != ''
  AND NOT EXISTS (
    SELECT 1 FROM user_crypto_wallets ucw 
    WHERE ucw.address = u.wallet_address
  );

-- Optional: Clear the wallet_address column from users table after migration
-- Uncomment the line below if you want to remove the old column data
-- UPDATE users SET wallet_address = NULL WHERE wallet_address IS NOT NULL;

-- Added conditional check for audit_logs table before inserting
-- Add a comment to track this migration (only if audit_logs table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO audit_logs (actor_type, action, status, metadata, created_at)
        VALUES (
            'system',
            'migrate_wallet_addresses',
            'completed',
            '{"description": "Migrated existing wallet addresses from users table to user_crypto_wallets table"}',
            now()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;
