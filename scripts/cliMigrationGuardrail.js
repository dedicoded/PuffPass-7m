#!/usr/bin/env node
import { runMigration } from "./migrationGuardrail.js"

// Grab SQL from CLI args
const args = process.argv.slice(2)
if (args.length === 0) {
  console.error("❌ Please provide a SQL statement in quotes.")
  console.error('Usage: pnpm migrate:safe "ALTER TABLE ..." migration-name')
  process.exit(1)
}

const migrationSql = args[0]

// Optional: allow a name for the migration file
const name = args[1] || "adhoc-migration"

runMigration(migrationSql, {
  name,
  // Add required tables if you want to enforce pre-checks
  requiredTables: [],
})
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
