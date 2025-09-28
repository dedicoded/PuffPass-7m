-- Enhanced Rewards System with Float Management (Fixed Version)
-- This script creates the missing tables for the Puff Vault ecosystem

-- Fixed foreign key references and added proper error handling

-- Rewards catalog table for merchant-published rewards
CREATE TABLE IF NOT EXISTS rewards_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchant_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('discount', 'event', 'product', 'merch')),
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    value_dollars DECIMAL(10,2) DEFAULT 0,
    image_url TEXT,
    availability_count INTEGER, -- NULL means unlimited
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward redemptions tracking
CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    reward_id UUID REFERENCES rewards_catalog(id) ON DELETE CASCADE,
    points_spent INTEGER NOT NULL,
    redemption_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired')),
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Puff Vault balance tracking
CREATE TABLE IF NOT EXISTS puff_vault_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    merchant_contributions DECIMAL(15,2) NOT NULL DEFAULT 0,
    rewards_pool_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    float_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    reserve_ratio DECIMAL(5,4) NOT NULL DEFAULT 0.1000, -- 10% reserve ratio
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchant fee contributions to the vault
CREATE TABLE IF NOT EXISTS merchant_fee_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchant_profiles(id) ON DELETE CASCADE,
    transaction_id UUID,
    fee_type VARCHAR(50) NOT NULL CHECK (fee_type IN ('transaction_fee', 'withdrawal_fee', 'processing_fee')),
    fee_amount DECIMAL(10,2) NOT NULL,
    contribution_to_vault DECIMAL(10,2) NOT NULL,
    contribution_to_rewards DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Float allocation management
CREATE TABLE IF NOT EXISTS float_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allocation_type VARCHAR(50) NOT NULL CHECK (allocation_type IN ('stablecoins', 'fiat_reserves', 'yield_deployment')),
    allocated_amount DECIMAL(15,2) NOT NULL,
    allocation_percentage DECIMAL(5,4) NOT NULL,
    target_apy DECIMAL(5,4) DEFAULT 0,
    current_apy DECIMAL(5,4) DEFAULT 0,
    last_rebalanced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yield generation tracking
CREATE TABLE IF NOT EXISTS yield_generation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allocation_id UUID REFERENCES float_allocations(id) ON DELETE CASCADE,
    yield_amount DECIMAL(12,2) NOT NULL,
    yield_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    yield_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    apy_achieved DECIMAL(5,4) NOT NULL,
    strategy_used VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction history for comprehensive tracking
CREATE TABLE IF NOT EXISTS puff_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('onramp', 'purchase', 'withdrawal', 'reward', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    puff_amount DECIMAL(10,2),
    merchant_id UUID REFERENCES merchant_profiles(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Added proper error handling for inserts with DO NOTHING on conflict

-- Initialize Puff Vault with default values (only if no records exist)
INSERT INTO puff_vault_balances (total_balance, merchant_contributions, rewards_pool_balance, float_balance)
SELECT 1250000.00, 125000.00, 50000.00, 1075000.00
WHERE NOT EXISTS (SELECT 1 FROM puff_vault_balances);

-- Initialize default float allocations (only if no records exist)
INSERT INTO float_allocations (allocation_type, allocated_amount, allocation_percentage, target_apy, current_apy)
SELECT * FROM (VALUES
    ('stablecoins', 750000.00, 0.7000, 0.0250, 0.0250),
    ('fiat_reserves', 268750.00, 0.2500, 0.0000, 0.0000),
    ('yield_deployment', 53750.00, 0.0500, 0.0480, 0.0480)
) AS v(allocation_type, allocated_amount, allocation_percentage, target_apy, current_apy)
WHERE NOT EXISTS (SELECT 1 FROM float_allocations WHERE allocation_type = v.allocation_type);

-- Fixed sample data insertion to handle cases where no merchants exist
-- Sample rewards catalog data (only insert if merchants exist)
DO $$
DECLARE
    sample_merchant_id UUID;
BEGIN
    -- Get a sample merchant ID
    SELECT id INTO sample_merchant_id FROM merchant_profiles LIMIT 1;
    
    -- Only insert if we have a merchant
    IF sample_merchant_id IS NOT NULL THEN
        INSERT INTO rewards_catalog (merchant_id, name, description, category, points_cost, value_dollars, image_url)
        SELECT sample_merchant_id, name, description, category, points_cost, value_dollars, image_url
        FROM (VALUES
            ('10% Off Next Order', 'Get 10% discount on your next cannabis purchase', 'discount', 200, 10.00, '/placeholder.svg?height=200&width=300'),
            ('Free Delivery', 'Free delivery on orders over $50', 'discount', 150, 8.00, '/placeholder.svg?height=200&width=300'),
            ('Cannabis Education Workshop', 'Join our monthly cannabis education session', 'event', 500, 25.00, '/placeholder.svg?height=200&width=300'),
            ('Premium Grinder', 'High-quality 4-piece aluminum grinder', 'product', 800, 40.00, '/placeholder.svg?height=200&width=300'),
            ('PuffPass T-Shirt', 'Official PuffPass branded merchandise', 'merch', 300, 15.00, '/placeholder.svg?height=200&width=300')
        ) AS v(name, description, category, points_cost, value_dollars, image_url)
        WHERE NOT EXISTS (SELECT 1 FROM rewards_catalog WHERE rewards_catalog.name = v.name);

        -- Sample merchant contributions
        INSERT INTO merchant_fee_contributions (merchant_id, fee_type, fee_amount, contribution_to_vault, contribution_to_rewards)
        SELECT sample_merchant_id, fee_type, fee_amount, contribution_to_vault, contribution_to_rewards
        FROM (VALUES
            ('transaction_fee', 25.00, 20.00, 5.00),
            ('withdrawal_fee', 37.50, 30.00, 7.50),
            ('processing_fee', 15.00, 12.00, 3.00)
        ) AS v(fee_type, fee_amount, contribution_to_vault, contribution_to_rewards)
        WHERE NOT EXISTS (SELECT 1 FROM merchant_fee_contributions WHERE merchant_fee_contributions.fee_type = v.fee_type);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_category ON rewards_catalog(category);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_active ON rewards_catalog(is_active);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_merchant_contributions_merchant ON merchant_fee_contributions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_puff_transactions_user ON puff_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_puff_transactions_type ON puff_transactions(transaction_type);

-- Fixed function creation with proper error handling
-- Update triggers for maintaining updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (drop first if they exist to avoid conflicts)
DROP TRIGGER IF EXISTS update_rewards_catalog_updated_at ON rewards_catalog;
CREATE TRIGGER update_rewards_catalog_updated_at 
    BEFORE UPDATE ON rewards_catalog 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_puff_vault_balances_updated_at ON puff_vault_balances;
CREATE TRIGGER update_puff_vault_balances_updated_at 
    BEFORE UPDATE ON puff_vault_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
