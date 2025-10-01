-- Puff Pass Core Schema Migration
-- This creates the foundational tables for the Puff Pass platform
-- All statements are idempotent and PostgreSQL-compatible

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'consumer', -- consumer, merchant, trustee, admin
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

-- Create wallets table for linked addresses
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address VARCHAR(255) NOT NULL,
  chain VARCHAR(50) NOT NULL DEFAULT 'ethereum', -- ethereum, polygon, etc.
  wallet_type VARCHAR(50) NOT NULL DEFAULT 'external', -- external, custodial
  is_trusted BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  balance_wei BIGINT DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(address, chain)
);

-- Create rewards catalog table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  points_required INTEGER NOT NULL DEFAULT 0,
  cash_value_cents INTEGER DEFAULT 0,
  stock_quantity INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  redemption_rules JSONB DEFAULT '{}',
  terms_conditions TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vault table for float contributions and yield tracking
CREATE TABLE IF NOT EXISTS vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contribution_amount_wei BIGINT NOT NULL DEFAULT 0,
  current_balance_wei BIGINT NOT NULL DEFAULT 0,
  yield_earned_wei BIGINT DEFAULT 0,
  apy_percentage DECIMAL(5,2) DEFAULT 0.00,
  lock_period_days INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create audit_logs table for comprehensive tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_type VARCHAR(50) NOT NULL DEFAULT 'user', -- user, system, api
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hash VARCHAR(64), -- For integrity verification
  metadata JSONB DEFAULT '{}'
);

-- Create user_rewards table for tracking earned/redeemed rewards
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'earned', -- earned, redeemed, expired
  points_used INTEGER DEFAULT 0,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redemption_code VARCHAR(100),
  metadata JSONB DEFAULT '{}'
);

-- Create transactions table for all platform transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  transaction_type VARCHAR(50) NOT NULL, -- deposit, withdrawal, reward, yield, fee
  amount_wei BIGINT NOT NULL DEFAULT 0,
  fee_wei BIGINT DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, failed, cancelled
  blockchain_hash VARCHAR(255),
  block_number BIGINT,
  gas_used BIGINT,
  gas_price_wei BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Now create all indexes separately (PostgreSQL requirement)
-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Wallets table indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_chain ON wallets(chain);
CREATE INDEX IF NOT EXISTS idx_wallets_is_trusted ON wallets(is_trusted);
CREATE INDEX IF NOT EXISTS idx_wallets_is_primary ON wallets(is_primary);

-- Rewards table indexes
CREATE INDEX IF NOT EXISTS idx_rewards_merchant_id ON rewards(merchant_id);
CREATE INDEX IF NOT EXISTS idx_rewards_category ON rewards(category);
CREATE INDEX IF NOT EXISTS idx_rewards_is_active ON rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_rewards_is_featured ON rewards(is_featured);
CREATE INDEX IF NOT EXISTS idx_rewards_points_required ON rewards(points_required);
CREATE INDEX IF NOT EXISTS idx_rewards_valid_until ON rewards(valid_until);

-- Vault table indexes
CREATE INDEX IF NOT EXISTS idx_vault_user_id ON vault(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_is_locked ON vault(is_locked);
CREATE INDEX IF NOT EXISTS idx_vault_locked_until ON vault(locked_until);
CREATE INDEX IF NOT EXISTS idx_vault_created_at ON vault(created_at DESC);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_hash ON audit_logs(hash);

-- User rewards table indexes
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_reward_id ON user_rewards(reward_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);
CREATE INDEX IF NOT EXISTS idx_user_rewards_expires_at ON user_rewards(expires_at);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_blockchain_hash ON transactions(blockchain_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_confirmed_at ON transactions(confirmed_at DESC);
