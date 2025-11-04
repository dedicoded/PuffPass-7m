-- Insert sample cannabis products
-- Removed image_url column as products table uses images (jsonb) instead
INSERT INTO products (name, description, category, thc_content, cbd_content, price, stock_quantity, images) VALUES
('Blue Dream', 'A balanced hybrid strain with sweet berry aroma', 'flower', 18.5, 2.1, 45.00, 25, '["https://placeholder.svg?height=200&width=200"]'::jsonb),
('OG Kush', 'Classic indica-dominant strain with earthy pine flavors', 'flower', 22.3, 0.8, 50.00, 18, '["https://placeholder.svg?height=200&width=200"]'::jsonb),
('Sour Diesel', 'Energizing sativa with diesel-like aroma', 'flower', 20.1, 1.2, 48.00, 22, '["https://placeholder.svg?height=200&width=200"]'::jsonb),
('CBD Gummies', 'Relaxing gummies with 10mg CBD each', 'edibles', 0.0, 10.0, 25.00, 50, '["https://placeholder.svg?height=200&width=200"]'::jsonb),
('THC Chocolate', 'Premium dark chocolate with 5mg THC per piece', 'edibles', 5.0, 0.0, 15.00, 35, '["https://placeholder.svg?height=200&width=200"]'::jsonb),
('Vape Cartridge', 'Premium distillate cartridge', 'concentrates', 85.2, 2.5, 65.00, 12, '["https://placeholder.svg?height=200&width=200"]'::jsonb)
ON CONFLICT DO NOTHING;
