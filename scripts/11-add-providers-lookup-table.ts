import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function addProvidersLookupTable() {
  try {
    console.log("[v0] Starting migration: Adding providers lookup table...")

    // Check if providers table already exists
    const checkTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'providers'
    `

    if (checkTable.length > 0) {
      console.log('[v0] Table "providers" already exists, skipping migration')
      return
    }

    // Create providers lookup table
    await sql`
      CREATE TABLE providers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log("[v0] Created providers table")

    // Seed with initial providers
    await sql`
      INSERT INTO providers (name, display_name, is_active) VALUES
      ('cybrid', 'Cybrid', true),
      ('sphere', 'Sphere', true)
    `
    console.log("[v0] Seeded providers table with cybrid and sphere")

    // Check if provider_id column already exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'puff_transactions' 
      AND column_name = 'provider_id'
    `

    if (checkColumn.length === 0) {
      // Add provider_id column to puff_transactions
      await sql`
        ALTER TABLE puff_transactions 
        ADD COLUMN provider_id INTEGER
      `
      console.log("[v0] Added provider_id column to puff_transactions")

      // Backfill existing rows with Cybrid provider ID
      await sql`
        UPDATE puff_transactions
        SET provider_id = (SELECT id FROM providers WHERE name = 'cybrid')
        WHERE provider_id IS NULL
      `
      console.log("[v0] Backfilled existing rows with Cybrid provider")

      // Make provider_id NOT NULL
      await sql`
        ALTER TABLE puff_transactions
        ALTER COLUMN provider_id SET NOT NULL
      `
      console.log("[v0] Set provider_id to NOT NULL")

      // Add foreign key constraint
      await sql`
        ALTER TABLE puff_transactions
        ADD CONSTRAINT fk_puff_transactions_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id)
      `
      console.log("[v0] Added foreign key constraint")

      // Create index for performance
      await sql`
        CREATE INDEX idx_puff_transactions_provider_id 
        ON puff_transactions(provider_id)
      `
      console.log("[v0] Created index on provider_id")
    } else {
      console.log('[v0] Column "provider_id" already exists, skipping column addition')
    }

    console.log("[v0] Migration completed successfully!")
    console.log("[v0] You now have a scalable multi-provider architecture")
  } catch (error) {
    console.error("[v0] Migration failed:", error)
    throw error
  }
}

addProvidersLookupTable()
