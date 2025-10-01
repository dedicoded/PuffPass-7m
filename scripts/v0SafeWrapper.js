#!/usr/bin/env node
import fs from "fs"
import path from "path"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

/**
 * Utility: rewrite SQL into idempotent-safe form
 * - CREATE TABLE → CREATE TABLE IF NOT EXISTS
 * - ALTER TABLE ADD COLUMN → ADD COLUMN IF NOT EXISTS
 * - CREATE VIEW → CREATE OR REPLACE VIEW
 */
function rewriteSql(sqlText) {
  return sqlText
    .replace(/CREATE TABLE (?!IF NOT EXISTS)/gi, "CREATE TABLE IF NOT EXISTS")
    .replace(/ADD COLUMN (?!IF NOT EXISTS)/gi, "ADD COLUMN IF NOT EXISTS")
    .replace(/CREATE VIEW/gi, "CREATE OR REPLACE VIEW")
    .replace(/CREATE INDEX (?!IF NOT EXISTS)/gi, "CREATE INDEX IF NOT EXISTS")
}

/**
 * Run a v0-suggested SQL safely:
 * 1. Rewrite into idempotent form
 * 2. Dry-run inside a transaction (ROLLBACK)
 * 3. Commit only if validation passes
 * 4. Save to migrations folder with timestamp
 */
export async function runV0Safe(sqlText, { name = "v0-migration" } = {}) {
  const safeSql = rewriteSql(sqlText)

  try {
    // 1. Dry-run validation
    console.log("🔍 Dry-running migration...")
    await sql`BEGIN`
    await sql.unsafe(safeSql)
    await sql`ROLLBACK`

    // 2. Apply for real
    console.log("✅ Migration validated, applying...")
    await sql`BEGIN`
    await sql.unsafe(safeSql)
    await sql`COMMIT`

    // 3. Save migration file
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .slice(0, 14)
    const filename = `${timestamp}_${name}.sql`
    const filepath = path.join("./migrations", filename)

    fs.mkdirSync("./migrations", { recursive: true })
    fs.writeFileSync(filepath, safeSql.trim() + "\n")

    console.log(`📂 Migration saved: ${filepath}`)
    console.log("🎉 Migration applied and persisted successfully!")
  } catch (err) {
    console.error("❌ Migration failed:", err.message)
    throw err
  }
}

// CLI usage
if (process.argv[2]) {
  const sqlInput = process.argv[2]
  const name = process.argv[3] || "v0-migration"
  runV0Safe(sqlInput, { name })
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
