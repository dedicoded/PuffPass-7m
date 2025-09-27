-- Seed the database with sample data for testing
-- This script adds sample merchants, products, and other test data

-- Insert sample merchant profiles (these will be in pending status initially)
INSERT INTO merchant_profiles (
    user_id, business_name, business_type, license_number, license_expiry,
    address, city, state, zip_code, phone, email, description, status
) VALUES 
(
    (SELECT id FROM neon_auth.users_sync LIMIT 1), -- Use first available user
    'Green Valley Dispensary',
    'Retail Dispensary',
    'LIC-2024-001',
    '2025-12-31',
    '123 Main Street',
    'San Francisco',
    'CA',
    '94102',
    '(415) 555-0123',
    'info@greenvalley.com',
    'Premium cannabis products with a focus on quality and customer service.',
    'approved'
),
(
    (SELECT id FROM neon_auth.users_sync LIMIT 1), -- Use first available user  
    'Mountain High Cannabis',
    'Cultivation & Retail',
    'LIC-2024-002',
    '2025-11-30',
    '456 Oak Avenue',
    'Oakland',
    'CA',
    '94601',
    '(510) 555-0456',
    'contact@mountainhigh.com',
    'Craft cannabis grown with sustainable practices in the California mountains.',
    'approved'
);

-- Insert sample products
INSERT INTO products (
    merchant_id, name, description, category, subcategory, strain_type,
    thc_content, cbd_content, price, stock_quantity, unit, status, featured
) VALUES 
(
    (SELECT id FROM merchant_profiles WHERE business_name = 'Green Valley Dispensary'),
    'Blue Dream',
    'A balanced hybrid strain with sweet berry aroma and cerebral, full-body effects.',
    'Flower',
    'Hybrid',
    'hybrid',
    18.5,
    0.8,
    45.00,
    50,
    'eighth',
    'active',
    true
),
(
    (SELECT id FROM merchant_profiles WHERE business_name = 'Green Valley Dispensary'),
    'OG Kush',
    'Classic indica-dominant strain known for its stress-relieving properties.',
    'Flower',
    'Indica',
    'indica',
    22.3,
    0.5,
    50.00,
    30,
    'eighth',
    'active',
    true
),
(
    (SELECT id FROM merchant_profiles WHERE business_name = 'Mountain High Cannabis'),
    'Sour Diesel',
    'Energizing sativa strain with diesel-like aroma and uplifting effects.',
    'Flower',
    'Sativa',
    'sativa',
    20.1,
    0.3,
    48.00,
    25,
    'eighth',
    'active',
    false
),
(
    (SELECT id FROM merchant_profiles WHERE business_name = 'Mountain High Cannabis'),
    'CBD Tincture',
    'High-CBD tincture perfect for wellness and relaxation without psychoactive effects.',
    'Tinctures',
    'CBD',
    'cbd',
    0.5,
    25.0,
    35.00,
    100,
    'bottle',
    'active',
    true
);

-- Insert sample user profile
INSERT INTO user_profiles (
    user_id, first_name, last_name, phone, 
    address, city, state, zip_code, total_puff_points
) VALUES (
    (SELECT id FROM neon_auth.users_sync LIMIT 1),
    'John',
    'Doe',
    '(555) 123-4567',
    '789 Customer Lane',
    'San Francisco',
    'CA',
    '94103',
    150
);

-- Insert sample puff points transactions
INSERT INTO puff_points (
    user_id, points, transaction_type, description
) VALUES 
(
    (SELECT id FROM neon_auth.users_sync LIMIT 1),
    100,
    'earned',
    'Welcome bonus for new account'
),
(
    (SELECT id FROM neon_auth.users_sync LIMIT 1),
    50,
    'earned',
    'Points earned from first purchase'
);
