import fs from "fs"
import path from "path"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

/**
 * Safely validate and persist a migration.
 * 1. Check schema prerequisites
 * 2. Dry-run inside a transaction (ROLLBACK)
 * 3. Commit only if validation passes
 * 4. Write migration file with timestamped name
 */
export async function runMigration(
  migrationSql,
  { requiredTables = [], migrationsDir = "./migrations", name = "unnamed-migration" } = {},
) {
  try {
    // 1. Check schema prerequisites
    for (const table of requiredTables) {
      const res = await sql`
        SELECT to_regclass(${table}) AS exists;
      `
      if (!res[0].exists) {
        throw new Error(`Missing required table: ${table}`)
      }
    }

    // 2. Dry-run migration
    console.log("🔍 Dry-running migration...")
    await sql
      .transaction(async (txn) => {
        await txn([migrationSql])
        throw new Error("ROLLBACK") // Force rollback for dry-run
      })
      .catch((err) => {
        if (err.message !== "ROLLBACK") throw err
      })

    // 3. Apply migration for real
    console.log("✅ Migration validated, applying...")
    await sql.transaction(async (txn) => {
      await txn([migrationSql])
    })

    // 4. Write migration file
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .slice(0, 14)
    const filename = `${timestamp}_${name}.sql`
    const filepath = path.join(migrationsDir, filename)

    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true })
    }

    fs.writeFileSync(filepath, migrationSql.trim() + "\n")
    console.log(`📂 Migration saved: ${filepath}`)

    console.log("🎉 Migration applied and persisted successfully!")
  } catch (err) {
    console.error("❌ Migration failed:", err.message)
    throw err
  }
}
