-- Insert sample merchant profiles
INSERT INTO merchant_profiles (user_id, business_name, license_number, license_type, business_address, phone, email, metrc_facility_id, approval_status)
VALUES 
    ('sample-merchant-1', 'Green Valley Dispensary', 'CA-LIC-001', 'Retail', '{"street": "123 Cannabis St", "city": "Los Angeles", "state": "CA", "zip": "90210"}', '555-0123', 'contact@greenvalley.com', 'METRC-001', 'approved'),
    ('sample-merchant-2', 'Sunset Cannabis Co', 'CA-LIC-002', 'Retail', '{"street": "456 Hemp Ave", "city": "San Francisco", "state": "CA", "zip": "94102"}', '555-0124', 'info@sunsetcannabis.com', 'METRC-002', 'pending');

-- Insert sample products
INSERT INTO products (name, description, category, strain_type, thc_percentage, cbd_percentage, price_per_unit, unit_type, merchant_id, stock_quantity, lab_tested, status)
VALUES 
    ('Blue Dream', 'A balanced hybrid strain with sweet berry aroma', 'flower', 'hybrid', 18.5, 0.8, 45.00, 'eighth', 'sample-merchant-1', 25, true, 'active'),
    ('OG Kush', 'Classic indica-dominant strain with earthy pine flavors', 'flower', 'indica', 22.3, 0.5, 50.00, 'eighth', 'sample-merchant-1', 15, true, 'active'),
    ('Sour Diesel', 'Energizing sativa with diesel-like aroma', 'flower', 'sativa', 20.1, 0.3, 48.00, 'eighth', 'sample-merchant-1', 30, true, 'active'),
    ('Cannabis Gummies', 'Mixed berry flavored edibles', 'edibles', null, 10.0, 0.0, 25.00, 'package', 'sample-merchant-1', 50, true, 'active'),
    ('Live Resin Cart', 'Premium live resin vape cartridge', 'concentrates', 'hybrid', 85.2, 1.2, 65.00, 'cartridge', 'sample-merchant-2', 20, true, 'active');

-- Insert sample orders
INSERT INTO orders (customer_id, merchant_id, total_amount, tax_amount, status, payment_method, delivery_method)
VALUES 
    ('sample-customer-1', 'sample-merchant-1', 95.00, 8.55, 'completed', 'puff_pass', 'pickup'),
    ('sample-customer-2', 'sample-merchant-1', 50.00, 4.50, 'processing', 'puff_pass', 'delivery');

-- Insert sample puff points
INSERT INTO puff_points (user_id, points_earned, points_balance, transaction_type, transaction_description)
VALUES 
    ('sample-customer-1', 95, 95, 'earned', 'Points earned from order'),
    ('sample-customer-2', 50, 50, 'earned', 'Points earned from order');
