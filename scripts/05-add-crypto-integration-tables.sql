-- Add crypto integration fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS cybrid_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sphere_customer_id VARCHAR(255);

-- Create user bank accounts table for Cybrid integration
CREATE TABLE IF NOT EXISTS user_bank_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    cybrid_account_id VARCHAR(255) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create crypto transactions table for Sphere integration
CREATE TABLE IF NOT EXISTS crypto_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create crypto wallets table
CREATE TABLE IF NOT EXISTS user_crypto_wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_cybrid_customer ON users(cybrid_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_sphere_customer ON users(sphere_customer_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user ON user_bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user ON crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user ON user_crypto_wallets(user_id);
