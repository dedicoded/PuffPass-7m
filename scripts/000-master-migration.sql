-- Puff Pass Master Migration Script
-- This script creates all required tables and columns for the platform
-- It is idempotent and can be run multiple times safely

-- ============================================
-- STEP 1: Enable Required PostgreSQL Extensions
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 2: Create Core Users Table
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  wallet_address VARCHAR(255) UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth DATE,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  profile_data JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}'
);

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
    ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='wallet_address') THEN
    ALTER TABLE users ADD COLUMN wallet_address VARCHAR(255) UNIQUE;
  END IF;
END $$;

-- ============================================
-- STEP 3: Create Crypto Wallets Table
-- ============================================

CREATE TABLE IF NOT EXISTS user_crypto_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL UNIQUE,
  chain VARCHAR(50) NOT NULL DEFAULT 'ethereum',
  wallet_type VARCHAR(50) NOT NULL DEFAULT 'external',
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  balance_wei BIGINT DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- STEP 4: Create Products Table
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  strain_type VARCHAR(50),
  thc_percentage DECIMAL(5,2),
  cbd_percentage DECIMAL(5,2),
  price_per_unit DECIMAL(10,2) NOT NULL,
  unit_type VARCHAR(50) NOT NULL,
  merchant_id UUID NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  metrc_id VARCHAR(255),
  lab_tested BOOLEAN DEFAULT false,
  lab_results JSONB,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to products table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url') THEN
    ALTER TABLE products ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- ============================================
-- STEP 5: Create Merchant Profiles Table
-- ============================================

CREATE TABLE IF NOT EXISTS merchant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(255) NOT NULL,
  license_type VARCHAR(100),
  business_address JSONB NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  metrc_facility_id VARCHAR(255),
  approval_status VARCHAR(50) DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to merchant_profiles table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='merchant_profiles' AND column_name='approval_status') THEN
    ALTER TABLE merchant_profiles ADD COLUMN approval_status VARCHAR(50) DEFAULT 'pending';
  END IF;
END $$;

-- ============================================
-- STEP 6: Create Orders Tables
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  merchant_id UUID NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'puff_pass',
  payment_status VARCHAR(50) DEFAULT 'pending',
  delivery_method VARCHAR(50),
  delivery_address JSONB,
  notes TEXT,
  metrc_manifest_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 7: Create Rewards Tables
-- ============================================

CREATE TABLE IF NOT EXISTS rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  points_cost INTEGER NOT NULL DEFAULT 0,
  value_dollars DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  stock_quantity INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES rewards_catalog(id),
  status VARCHAR(50) NOT NULL DEFAULT 'earned',
  points_used INTEGER DEFAULT 0,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redemption_code VARCHAR(100),
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- STEP 8: Create Puff Vault Tables
-- ============================================

CREATE TABLE IF NOT EXISTS puff_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_balance_usdc DECIMAL(20,6) DEFAULT 0,
  total_puff_tokens DECIMAL(20,6) DEFAULT 0,
  redemption_rate DECIMAL(10,6) DEFAULT 0.01,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS puff_vault_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type VARCHAR(50) NOT NULL,
  amount_usdc DECIMAL(20,6),
  amount_puff DECIMAL(20,6),
  user_id UUID,
  merchant_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS puff_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  puff_amount DECIMAL(20,6) NOT NULL,
  usdc_amount DECIMAL(20,6) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  transaction_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- STEP 9: Create Merchant Withdrawal Tables
-- ============================================

CREATE TABLE IF NOT EXISTS merchant_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  amount DECIMAL(20,6) NOT NULL,
  fee_amount DECIMAL(20,6) DEFAULT 0,
  net_amount DECIMAL(20,6) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  withdrawal_type VARCHAR(50) DEFAULT 'instant_ach',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- STEP 10: Create Projects Table (for deployment tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  repository_url TEXT,
  owner_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Add missing columns to projects table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='owner_id') THEN
    ALTER TABLE projects ADD COLUMN owner_id VARCHAR(255) NOT NULL DEFAULT 'system';
  END IF;
END $$;

-- ============================================
-- STEP 11: Create Indexes for Performance
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Crypto wallets indexes
CREATE INDEX IF NOT EXISTS idx_user_crypto_wallets_user_id ON user_crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crypto_wallets_wallet_address ON user_crypto_wallets(wallet_address);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Merchant profiles indexes
CREATE INDEX IF NOT EXISTS idx_merchant_profiles_user_id ON merchant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_profiles_approval_status ON merchant_profiles(approval_status);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Rewards indexes
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_merchant_id ON rewards_catalog(merchant_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);

-- Withdrawals indexes
CREATE INDEX IF NOT EXISTS idx_merchant_withdrawals_merchant_id ON merchant_withdrawals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_withdrawals_status ON merchant_withdrawals(status);

-- ============================================
-- STEP 12: Insert Initial Puff Vault Record
-- ============================================

INSERT INTO puff_vault (total_balance_usdc, total_puff_tokens, redemption_rate)
VALUES (0, 0, 0.01)
ON CONFLICT DO NOTHING;

-- ============================================
-- Migration Complete
-- ============================================

SELECT 'Master migration completed successfully!' AS status;
