-- Create providers lookup table
CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default providers
INSERT INTO providers (name, display_name) VALUES
  ('cybrid', 'Cybrid Banking'),
  ('sphere', 'Sphere Pay'),
  ('system', 'System'),
  ('apple-pay', 'Apple Pay'),
  ('cash-app', 'Cash App'),
  ('zelle', 'Zelle'),
  ('venmo', 'Venmo'),
  ('bank-transfer', 'Bank Transfer')
ON CONFLICT (name) DO NOTHING;
