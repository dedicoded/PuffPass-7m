-- Create cannabis platform tables
-- Products table for cannabis inventory
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- flower, edibles, concentrates, etc.
    strain_type VARCHAR(50), -- indica, sativa, hybrid
    thc_percentage DECIMAL(5,2),
    cbd_percentage DECIMAL(5,2),
    price_per_unit DECIMAL(10,2) NOT NULL,
    unit_type VARCHAR(50) NOT NULL, -- gram, eighth, quarter, etc.
    merchant_id TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    metrc_id VARCHAR(255), -- METRC compliance tracking
    lab_tested BOOLEAN DEFAULT false,
    lab_results JSONB,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, out_of_stock
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (merchant_id) REFERENCES neon_auth.users_sync(id)
);

-- Orders table for purchase transactions
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, completed, cancelled
    payment_method VARCHAR(50) DEFAULT 'puff_pass',
    payment_status VARCHAR(50) DEFAULT 'pending',
    delivery_method VARCHAR(50), -- pickup, delivery
    delivery_address JSONB,
    notes TEXT,
    metrc_manifest_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES neon_auth.users_sync(id),
    FOREIGN KEY (merchant_id) REFERENCES neon_auth.users_sync(id)
);

-- Order items for individual products in orders
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Merchant profiles for additional business information
CREATE TABLE IF NOT EXISTS merchant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(255) NOT NULL,
    license_type VARCHAR(100),
    business_address JSONB NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    metrc_facility_id VARCHAR(255),
    approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, suspended
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES neon_auth.users_sync(id),
    FOREIGN KEY (approved_by) REFERENCES neon_auth.users_sync(id)
);

-- Puff Points rewards system
CREATE TABLE IF NOT EXISTS puff_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    points_earned INTEGER DEFAULT 0,
    points_spent INTEGER DEFAULT 0,
    points_balance INTEGER DEFAULT 0,
    transaction_type VARCHAR(50) NOT NULL, -- earned, spent, expired
    transaction_description TEXT,
    order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES neon_auth.users_sync(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Admin approval workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type VARCHAR(100) NOT NULL, -- merchant_approval, product_approval, etc.
    entity_id UUID NOT NULL, -- ID of the entity being approved
    entity_type VARCHAR(100) NOT NULL, -- merchant_profile, product, etc.
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    requested_by TEXT NOT NULL,
    assigned_to TEXT,
    approved_by TEXT,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (requested_by) REFERENCES neon_auth.users_sync(id),
    FOREIGN KEY (assigned_to) REFERENCES neon_auth.users_sync(id),
    FOREIGN KEY (approved_by) REFERENCES neon_auth.users_sync(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_merchant_profiles_user_id ON merchant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_profiles_approval_status ON merchant_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_puff_points_user_id ON puff_points(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_assigned_to ON approval_workflows(assigned_to);
