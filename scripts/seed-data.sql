-- Seed data for MyCora cannabis platform
-- Run this after creating tables to populate with sample data

-- Insert sample users
INSERT INTO users (email, password_hash, role, first_name, last_name, date_of_birth, is_verified) VALUES
('admin@mycora.com', '$2b$10$example_hash', 'admin', 'Admin', 'User', '1990-01-01', true),
('merchant@example.com', '$2b$10$example_hash', 'merchant', 'Jane', 'Merchant', '1985-05-15', true),
('customer@example.com', '$2b$10$example_hash', 'customer', 'John', 'Customer', '1995-08-20', true);

-- Insert sample products
INSERT INTO products (merchant_id, name, description, category, strain, thc_content, cbd_content, price, inventory) VALUES
((SELECT id FROM users WHERE email = 'merchant@example.com'), 'Blue Dream', 'Premium hybrid strain with balanced effects', 'flower', 'Blue Dream', 18.5, 0.5, 45.00, 100),
((SELECT id FROM users WHERE email = 'merchant@example.com'), 'CBD Gummies', 'Relaxing CBD-infused gummies', 'edibles', NULL, 0.0, 25.0, 30.00, 50),
((SELECT id FROM users WHERE email = 'merchant@example.com'), 'Live Resin Cart', 'High-quality live resin vape cartridge', 'concentrates', 'OG Kush', 85.0, 2.0, 65.00, 25);
