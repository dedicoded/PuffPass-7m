import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

let _db: ReturnType<typeof drizzle> | null = null
let _migrationRun = false

export async function getDb() {
  if (_db === null) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set")
    }
    const sql = neon(process.env.DATABASE_URL)
    _db = drizzle(sql, { schema })
  }

  // Run migrations once per process lifecycle
  if (!_migrationRun) {
    await ensureBaselineSchema(_db)
    _migrationRun = true
  }

  return _db
}

async function ensureBaselineSchema(db: ReturnType<typeof drizzle>) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth TIMESTAMP,
        phone_number TEXT,
        is_verified BOOLEAN DEFAULT false,
        medical_card TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create products table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        strain TEXT,
        thc_content DECIMAL(5, 2),
        cbd_content DECIMAL(5, 2),
        price DECIMAL(10, 2) NOT NULL,
        inventory INTEGER DEFAULT 0,
        images JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create orders table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES users(id),
        merchant_id UUID REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'pending',
        total_amount DECIMAL(10, 2) NOT NULL,
        delivery_address JSONB,
        order_items JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create reviews table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id),
        customer_id UUID REFERENCES users(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    console.log("[v0] Baseline schema migration completed successfully")
  } catch (error) {
    console.error("[v0] Error ensuring baseline schema:", error)
    // Don't throw - allow app to continue even if migrations fail
  }
}

export * from "./schema"
