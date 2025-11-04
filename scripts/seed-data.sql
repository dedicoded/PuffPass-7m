-- Seed data for PuffPass cannabis platform
-- Changed password_hash to password to match existing users table schema

-- Insert sample users (only if they don't exist)
INSERT INTO users (email, password, role, name, wallet_address) 
SELECT 'admin@puffpass.com', '$2b$10$example_hash', 'admin', 'Admin User', NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@puffpass.com');

INSERT INTO users (email, password, role, name, wallet_address)
SELECT 'merchant@example.com', '$2b$10$example_hash', 'merchant', 'Jane Merchant', NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'merchant@example.com');

INSERT INTO users (email, password, role, name, wallet_address)
SELECT 'customer@example.com', '$2b$10$example_hash', 'customer', 'John Customer', NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'customer@example.com');

-- Insert sample products
INSERT INTO products (merchant_id, name, description, category, strain_type, thc_content, cbd_content, price, stock_quantity, images) 
SELECT 
  (SELECT id FROM users WHERE email = 'merchant@example.com'),
  'Blue Dream',
  'Premium hybrid strain with balanced effects',
  'flower',
  'hybrid',
  18.5,
  0.5,
  45.00,
  100,
  '["https://placeholder.svg?height=200&width=200"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Blue Dream');

INSERT INTO products (merchant_id, name, description, category, strain_type, thc_content, cbd_content, price, stock_quantity, images)
SELECT
  (SELECT id FROM users WHERE email = 'merchant@example.com'),
  'CBD Gummies',
  'Relaxing CBD-infused gummies',
  'edibles',
  NULL,
  0.0,
  25.0,
  30.00,
  50,
  '["https://placeholder.svg?height=200&width=200"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'CBD Gummies');

INSERT INTO products (merchant_id, name, description, category, strain_type, thc_content, cbd_content, price, stock_quantity, images)
SELECT
  (SELECT id FROM users WHERE email = 'merchant@example.com'),
  'Live Resin Cart',
  'High-quality live resin vape cartridge',
  'concentrates',
  'indica',
  85.0,
  2.0,
  65.00,
  25,
  '["https://placeholder.svg?height=200&width=200"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Live Resin Cart');
