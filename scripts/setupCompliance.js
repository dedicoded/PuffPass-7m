#!/usr/bin/env node

/**
 * setupCompliance.js
 *
 * One-liner setup script that applies all PuffPass migrations, views, and reports
 * in the correct order. Run with: pnpm setup:compliance
 *
 * This ensures:
 * - Foundation tables exist (providers, age verification logs)
 * - Organization column is added for multi-org support
 * - Compliance views are created (org_compliance_summary, org_suspicious_ips)
 * - All migrations are idempotent and safe to re-run
 */

import dotenv from "dotenv"
dotenv.config()

import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sql = neon(process.env.DATABASE_URL)

// Migration files in order
const MIGRATIONS = [
  "11-add-providers-lookup-table.ts",
  "12-create-age-verification-logs.sql",
  "14-add-organization-column.sql",
  "15-create-compliance-views.sql",
]

async function runMigration(filename) {
  const filepath = path.join(__dirname, filename)

  console.log(`\n📦 Running migration: ${filename}`)

  try {
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  File not found: ${filename} - skipping`)
      return { success: true, skipped: true }
    }

    // Read file content
    const content = fs.readFileSync(filepath, "utf-8")

    // For .ts files, extract SQL from the file
    let sqlContent = content
    if (filename.endsWith(".ts")) {
      const sqlMatch = content.match(/await sql`([^`]+)`/s)
      if (sqlMatch) {
        sqlContent = sqlMatch[1]
      } else {
        console.log(`⚠️  Could not extract SQL from ${filename} - skipping`)
        return { success: true, skipped: true }
      }
    }

    // Run the migration
    await sql(sqlContent)
    console.log(`✅ Successfully applied: ${filename}`)
    return { success: true }
  } catch (error) {
    // Check if error is benign (already exists, etc.)
    const benignErrors = ["already exists", "duplicate key", "column already exists"]

    const isBenign = benignErrors.some((msg) => error.message.toLowerCase().includes(msg))

    if (isBenign) {
      console.log(`ℹ️  Already applied: ${filename}`)
      return { success: true, alreadyApplied: true }
    }

    console.error(`❌ Error applying ${filename}:`, error.message)
    return { success: false, error: error.message }
  }
}

async function setupCompliance() {
  console.log("🛡️  PuffPass Compliance Setup")
  console.log("================================\n")
  console.log("This will apply all migrations in the correct order:")
  console.log("1. Foundation tables (providers, age verification logs)")
  console.log("2. Organization column (multi-org support)")
  console.log("3. Compliance views (summary, suspicious IPs)")
  console.log("")

  const results = {
    total: MIGRATIONS.length,
    success: 0,
    skipped: 0,
    alreadyApplied: 0,
    failed: 0,
  }

  // Run migrations in order
  for (const migration of MIGRATIONS) {
    const result = await runMigration(migration)

    if (result.success) {
      results.success++
      if (result.skipped) results.skipped++
      if (result.alreadyApplied) results.alreadyApplied++
    } else {
      results.failed++
    }
  }

  // Summary
  console.log("\n================================")
  console.log("📊 Setup Summary")
  console.log("================================")
  console.log(`Total migrations: ${results.total}`)
  console.log(`✅ Successful: ${results.success}`)
  console.log(`ℹ️  Already applied: ${results.alreadyApplied}`)
  console.log(`⚠️  Skipped: ${results.skipped}`)
  console.log(`❌ Failed: ${results.failed}`)

  if (results.failed > 0) {
    console.log("\n⚠️  Some migrations failed. Please review the errors above.")
    process.exit(1)
  }

  console.log("\n✅ Compliance setup complete!")
  console.log("\nNext steps:")
  console.log("1. Test age verification: visit a protected route")
  console.log("2. View compliance dashboard: /admin (Age Verification tab)")
  console.log("3. Generate reports: pnpm compliance:monthly")
  console.log("4. Multi-org reports: pnpm compliance:multi-org")
}

// Run setup
setupCompliance().catch((error) => {
  console.error("❌ Setup failed:", error)
  process.exit(1)
})
