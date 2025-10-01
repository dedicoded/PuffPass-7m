import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function addProviderColumn() {
  try {
    console.log("[v0] Starting migration: Adding provider column...")

    // Check if column already exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'puff_transactions' 
      AND column_name = 'provider'
    `

    if (checkColumn.length > 0) {
      console.log('[v0] Column "provider" already exists, skipping migration')
      return
    }

    await sql`
      ALTER TABLE puff_transactions 
      ADD COLUMN provider TEXT
    `
    console.log("[v0] Successfully added provider column")

    await sql`
      UPDATE puff_transactions
      SET provider = 'cybrid'
      WHERE provider IS NULL
    `
    console.log("[v0] Backfilled existing rows with 'cybrid'")

    await sql`
      ALTER TABLE puff_transactions
      ADD CONSTRAINT provider_valid CHECK (provider IN ('cybrid', 'sphere'))
    `
    console.log("[v0] Added CHECK constraint for valid providers")

    await sql`
      ALTER TABLE puff_transactions
      ALTER COLUMN provider SET NOT NULL
    `
    console.log("[v0] Set provider column to NOT NULL")

    await sql`
      CREATE INDEX idx_puff_transactions_provider 
      ON puff_transactions(provider)
    `
    console.log("[v0] Created index on provider column")

    console.log("[v0] Migration completed successfully!")
    console.log("[v0] Your payment routes will now work correctly with the provider field")
  } catch (error) {
    console.error("[v0] Migration failed:", error)
    throw error
  }
}

addProviderColumn()
