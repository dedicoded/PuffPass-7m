-- Add crypto integration fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS cybrid_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sphere_customer_id VARCHAR(255);

-- Fixed foreign key references to use UUID instead of INTEGER to match existing users table
-- Create user bank accounts table for Cybrid integration
CREATE TABLE IF NOT EXISTS user_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    cybrid_account_id VARCHAR(255) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create crypto transactions table for Sphere integration
CREATE TABLE IF NOT EXISTS crypto_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    sphere_transfer_id VARCHAR(255) UNIQUE,
    cybrid_quote_id VARCHAR(255),
    amount DECIMAL(20, 8) NOT NULL,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    destination_address VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    transaction_hash VARCHAR(255),
    network_fee DECIMAL(20, 8),
    exchange_rate DECIMAL(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Updated user_crypto_wallets table to match API route expectations
-- Create crypto wallets table with columns expected by the API route
CREATE TABLE IF NOT EXISTS user_crypto_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,  -- Changed from wallet_address to address
    type VARCHAR(50) NOT NULL DEFAULT 'metamask',  -- Added type column
    trusted BOOLEAN DEFAULT FALSE,  -- Added trusted column
    currency VARCHAR(10) DEFAULT 'ETH',  -- Keep currency for compatibility
    network VARCHAR(50) DEFAULT 'ethereum',  -- Keep network for compatibility
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table that the data migration script expects
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_cybrid_customer ON users(cybrid_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_sphere_customer ON users(sphere_customer_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user ON user_bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user ON crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user ON user_crypto_wallets(user_id);
-- Added index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_address ON user_crypto_wallets(address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at);
