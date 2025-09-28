-- Create rewards catalog table for redeemable items
CREATE TABLE IF NOT EXISTS rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'discount', 'event', 'product', 'merch'
  points_cost INTEGER NOT NULL,
  value_dollars DECIMAL(10,2),
  image_url TEXT,
  availability_count INTEGER, -- null for unlimited
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create redemptions table to track when users redeem rewards
CREATE TABLE IF NOT EXISTS puff_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  reward_id UUID NOT NULL REFERENCES rewards_catalog(id),
  points_spent INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'fulfilled', 'expired'
  redemption_code VARCHAR(100),
  expires_at TIMESTAMP WITH TIME ZONE,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user tiers table
CREATE TABLE IF NOT EXISTS user_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  current_tier VARCHAR(50) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  tier_points INTEGER DEFAULT 0, -- points earned towards next tier
  lifetime_spent DECIMAL(10,2) DEFAULT 0,
  tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_id VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  points_awarded INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create puff vault rewards pool tracking
CREATE TABLE IF NOT EXISTS puff_vault_rewards_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_allocated DECIMAL(12,2) DEFAULT 0, -- total allocated to rewards
  total_redeemed DECIMAL(12,2) DEFAULT 0, -- total spent on redemptions
  available_balance DECIMAL(12,2) DEFAULT 0, -- available for rewards
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial rewards catalog items
INSERT INTO rewards_catalog (name, description, category, points_cost, value_dollars, image_url) VALUES
('$5 Off Next Purchase', 'Get $5 off your next cannabis purchase', 'discount', 500, 5.00, '/placeholder.svg?height=200&width=300'),
('$10 Off Next Purchase', 'Get $10 off your next cannabis purchase', 'discount', 1000, 10.00, '/placeholder.svg?height=200&width=300'),
('$25 Off Next Purchase', 'Get $25 off your next cannabis purchase', 'discount', 2500, 25.00, '/placeholder.svg?height=200&width=300'),
('420 Festival VIP Pass', 'VIP access to exclusive 420 events and festivals', 'event', 5000, 150.00, '/placeholder.svg?height=200&width=300'),
('Cannabis Expo Early Access', 'Get early access to cannabis expos and product launches', 'event', 3000, 75.00, '/placeholder.svg?height=200&width=300'),
('Exclusive Strain Drop', 'First access to limited edition strain releases', 'product', 4000, 100.00, '/placeholder.svg?height=200&width=300'),
('PuffPass Premium T-Shirt', 'Official PuffPass branded premium t-shirt', 'merch', 1500, 35.00, '/placeholder.svg?height=200&width=300'),
('PuffPass Stash Box', 'Premium wooden stash box with PuffPass branding', 'merch', 3500, 85.00, '/placeholder.svg?height=200&width=300'),
('Monthly Bonus Points', 'Earn 500 bonus points instantly', 'discount', 2000, 0.00, '/placeholder.svg?height=200&width=300');

-- Initialize the rewards pool with a starting balance
INSERT INTO puff_vault_rewards_pool (total_allocated, available_balance) VALUES (10000.00, 10000.00);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_puff_redemptions_user_id ON puff_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tiers_user_id ON user_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_category ON rewards_catalog(category);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_active ON rewards_catalog(is_active);
