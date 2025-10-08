"use server"

import type { NeonQueryFunction } from "@neondatabase/serverless"

// Table creation SQL statements
const MIGRATIONS = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE,
      name TEXT,
      password TEXT,
      wallet_address TEXT UNIQUE,
      role TEXT DEFAULT 'customer',
      dc_residency BOOLEAN DEFAULT false,
      patient_certification BOOLEAN DEFAULT false,
      referral_code TEXT,
      auth_method TEXT DEFAULT 'password',
      embedded_wallet TEXT,
      kyc_status TEXT DEFAULT 'pending',
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
  `,

  providers: `
    CREATE TABLE IF NOT EXISTS providers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    );
    INSERT INTO providers (name, display_name) 
    VALUES 
      ('cybrid', 'Cybrid'),
      ('sphere', 'Sphere Pay'),
      ('coinbase', 'Coinbase Commerce')
    ON CONFLICT (name) DO NOTHING;
  `,

  user_profiles: `
    CREATE TABLE IF NOT EXISTS user_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT UNIQUE NOT NULL,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      phone VARCHAR(50),
      date_of_birth DATE,
      address TEXT,
      city VARCHAR(255),
      state VARCHAR(50),
      zip_code VARCHAR(20),
      total_puff_points INTEGER DEFAULT 0,
      preferences JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
  `,

  merchant_profiles: `
    CREATE TABLE IF NOT EXISTS merchant_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT UNIQUE NOT NULL,
      business_name VARCHAR(255) NOT NULL,
      business_type VARCHAR(100),
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      city VARCHAR(255),
      state VARCHAR(50),
      zip_code VARCHAR(20),
      website VARCHAR(500),
      description TEXT,
      license_number VARCHAR(255),
      license_expiry DATE,
      status VARCHAR(50) DEFAULT 'pending',
      verification_status VARCHAR(50) DEFAULT 'pending',
      approved_by TEXT,
      approved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_merchant_profiles_user_id ON merchant_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_merchant_profiles_status ON merchant_profiles(status);
  `,

  puff_transactions: `
    CREATE TABLE IF NOT EXISTS puff_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      amount NUMERIC(20, 8) NOT NULL,
      puff_amount NUMERIC(20, 8) NOT NULL,
      transaction_type VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      description TEXT,
      order_id UUID,
      merchant_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_puff_transactions_user_id ON puff_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_puff_transactions_status ON puff_transactions(status);
  `,
}

// Track which tables have been checked/created in this session
const migratedTables = new Set<string>()

/**
 * Ensures a table exists by running its migration if needed.
 * Safe to call multiple times - uses CREATE TABLE IF NOT EXISTS.
 */
export async function ensureTable(
  sql: NeonQueryFunction<false, false>,
  tableName: keyof typeof MIGRATIONS,
): Promise<void> {
  const migrationSql = MIGRATIONS[tableName]
  if (!migrationSql) {
    throw new Error(`No migration found for table: ${tableName}`)
  }

  try {
    await sql(migrationSql)
  } catch (error) {
    console.error(`[v0] Failed to ensure table ${tableName}:`, error)
    throw error
  }
}

/**
 * Ensures all critical tables exist.
 * Call this on app startup or before critical operations.
 */
export async function ensureCriticalTables(sql: NeonQueryFunction<false, false>): Promise<void> {
  const tables = ["users", "providers", "user_profiles", "merchant_profiles", "puff_transactions"] as Array<
    keyof typeof MIGRATIONS
  >
  for (const table of tables) {
    await ensureTable(sql, table)
  }
}

/**
 * Resets the migration cache. Useful for testing.
 */
export function resetMigrationCache(): void {
  migratedTables.clear()
}
