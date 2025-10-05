import { sql } from "@vercel/postgres"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function createProvidersTable() {
  try {
    console.log("[v0] Connecting to database...")
    console.log("[v0] Connected successfully")

    // Read and execute the SQL file
    const sqlPath = join(__dirname, "01-create-providers-table.sql")
    const sqlContent = readFileSync(sqlPath, "utf-8")

    console.log("[v0] Creating providers table...")
    await sql.query(sqlContent)
    console.log("[v0] ✓ Providers table created successfully")

    // Verify the table was created
    const result = await sql`SELECT COUNT(*) FROM providers`
    console.log(`[v0] ✓ Providers table has ${result.rows[0].count} entries`)
  } catch (error) {
    console.error("[v0] Error creating providers table:", error)
    throw error
  }
}

createProvidersTable()
  .then(() => {
    console.log("[v0] Setup complete! You can now process payments.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Setup failed:", error.message)
    process.exit(1)
  })
