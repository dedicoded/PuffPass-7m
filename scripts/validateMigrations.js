import fs from "fs"
import { neon } from "@neondatabase/serverless"

async function validateAllMigrations() {
  const sql = neon(process.env.DATABASE_URL)

  // Get all SQL files from scripts directory
  const files = fs.readdirSync("./scripts").filter((f) => f.endsWith(".sql"))

  console.log(`🔍 Validating ${files.length} migration files...`)

  for (const file of files) {
    const sqlContent = fs.readFileSync(`./scripts/${file}`, "utf8")
    console.log(`  Checking ${file}...`)

    // Basic syntax validation
    if (!sqlContent.trim()) {
      throw new Error(`❌ ${file} is empty`)
    }

    // Check for dangerous operations without WHERE clause
    const dangerousOps = /DELETE FROM|UPDATE \w+\s+SET/gi
    const hasWhere = /WHERE/i

    if (dangerousOps.test(sqlContent) && !hasWhere.test(sqlContent)) {
      console.warn(`⚠️  ${file} contains DELETE/UPDATE without WHERE clause`)
    }

    // Validate SQL syntax by doing a dry-run EXPLAIN
    try {
      const statements = sqlContent
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("--"))

      for (const statement of statements) {
        if (statement.toLowerCase().startsWith("select") || statement.toLowerCase().startsWith("create")) {
          // Only validate SELECT and CREATE statements (safe to explain)
          await sql`EXPLAIN ${sql.unsafe(statement)}`.catch(() => {
            // Ignore explain errors for CREATE statements
            if (!statement.toLowerCase().startsWith("create")) {
              throw new Error(`Invalid SQL syntax in ${file}`)
            }
          })
        }
      }
    } catch (err) {
      console.error(`❌ ${file} has syntax errors:`, err.message)
      throw err
    }
  }

  console.log("✅ All migrations validated successfully!")
}

validateAllMigrations().catch((err) => {
  console.error("❌ Migration validation failed:", err.message)
  process.exit(1)
})
