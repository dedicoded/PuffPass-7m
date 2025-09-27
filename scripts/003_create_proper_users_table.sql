-- Enable UUID extension for auto-generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the proper users table with auto-generated UUIDs
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,                          -- hashed password
    role TEXT DEFAULT 'customer',                    -- customer, merchant, admin
    wallet_address TEXT,                             -- optional crypto wallet
    patient_certification BOOLEAN DEFAULT false,
    dc_residency BOOLEAN DEFAULT false,
    referral_code TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
