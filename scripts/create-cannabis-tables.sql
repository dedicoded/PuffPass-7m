-- Create cannabis platform tables
-- Updated to use correct schema references and check for existing columns
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  thc_content DECIMAL(5,2),
  cbd_content DECIMAL(5,2),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  merchant_id TEXT, -- Removed foreign key reference to users_sync
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id TEXT, -- Removed foreign key reference to users_sync
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  delivery_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  customer_id TEXT, -- Removed foreign key reference to users_sync
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if neon_auth.users_sync table exists before altering
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'neon_auth' AND table_name = 'users_sync') THEN
    ALTER TABLE neon_auth.users_sync ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';
    ALTER TABLE neon_auth.users_sync ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE neon_auth.users_sync ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
  END IF;
END $$;
