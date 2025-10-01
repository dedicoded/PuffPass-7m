-- Seed Sample Data (Idempotent)
-- Uses ON CONFLICT DO NOTHING to prevent duplicate inserts

-- Insert sample users with different roles
INSERT INTO users (id, email, username, role, first_name, last_name, is_verified, is_active) VALUES
(uuid_generate_v4(), 'admin@puffpass.com', 'admin', 'admin', 'Admin', 'User', true, true),
(uuid_generate_v4(), 'merchant@puffpass.com', 'merchant1', 'merchant', 'Test', 'Merchant', true, true),
(uuid_generate_v4(), 'consumer@puffpass.com', 'consumer1', 'consumer', 'Test', 'Consumer', true, true),
(uuid_generate_v4(), 'trustee@puffpass.com', 'trustee1', 'trustee', 'Test', 'Trustee', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample projects and environments for deployment tracking
INSERT INTO projects (name, repository_url, description) VALUES
('puffpass-frontend', 'https://github.com/puffpass/frontend', 'PuffPass frontend application'),
('puffpass-api', 'https://github.com/puffpass/api', 'PuffPass backend API'),
('puffpass-admin', 'https://github.com/puffpass/admin', 'PuffPass admin dashboard')
ON CONFLICT DO NOTHING;

INSERT INTO environments (project_name, name, description, variables) VALUES
('puffpass-frontend', 'production', 'Production environment for PuffPass frontend', '{"NODE_ENV": "production", "API_URL": "https://api.puffpass.com"}'),
('puffpass-frontend', 'staging', 'Staging environment for testing', '{"NODE_ENV": "staging", "API_URL": "https://staging-api.puffpass.com"}'),
('puffpass-api', 'production', 'Production API environment', '{"NODE_ENV": "production", "DATABASE_URL": "***", "JWT_SECRET": "***"}'),
('puffpass-api', 'staging', 'Staging API environment', '{"NODE_ENV": "staging", "DATABASE_URL": "***", "JWT_SECRET": "***"}')
ON CONFLICT (project_name, name) DO NOTHING;

-- Insert sample rewards (only if merchant exists)
DO $$
DECLARE
    merchant_user_id UUID;
BEGIN
    SELECT id INTO merchant_user_id FROM users WHERE email = 'merchant@puffpass.com' LIMIT 1;
    
    IF merchant_user_id IS NOT NULL THEN
        INSERT INTO rewards (merchant_id, title, description, category, points_required, cash_value_cents, stock_quantity, is_active, is_featured) VALUES
        (merchant_user_id, 'Free Coffee', 'Get a free medium coffee', 'Food & Beverage', 100, 500, 50, true, true),
        (merchant_user_id, '10% Off Purchase', 'Get 10% off your next purchase', 'Discount', 200, 0, null, true, false),
        (merchant_user_id, 'Premium Membership', 'One month premium membership', 'Membership', 500, 2000, 10, true, true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
