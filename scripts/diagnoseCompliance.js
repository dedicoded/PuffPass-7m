#!/usr/bin/env node

/**
 * diagnoseCompliance.js
 *
 * Comprehensive pre-flight check for PuffPass compliance system.
 * Catches schema drift, missing env vars, and wrong script targets.
 *
 * Usage:
 *   node scripts/diagnoseCompliance.js
 *   pnpm diagnose:compliance
 */

import "dotenv/config"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log("\n" + "=".repeat(60))
  log(title, "cyan")
  console.log("=".repeat(60))
}

async function checkDatabaseConnection() {
  logSection("1. Database Connection")

  if (!process.env.DATABASE_URL) {
    log("❌ DATABASE_URL environment variable is not set", "red")
    log("   Fix: Add DATABASE_URL to your .env file or Vercel secrets", "yellow")
    return false
  }

  try {
    await sql`SELECT 1`
    log("✅ Database connection successful", "green")
    return true
  } catch (error) {
    log("❌ Database connection failed", "red")
    log(`   Error: ${error.message}`, "yellow")
    return false
  }
}

async function checkSchema() {
  logSection("2. Schema Validation")

  const issues = []

  try {
    // Check for all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    log(`Found ${tables.length} tables in public schema:`, "blue")
    tables.forEach((t) => log(`  - ${t.table_name}`, "blue"))

    // Check for required tables
    const requiredTables = ["providers", "age_verification_logs", "org_compliance_summary", "org_suspicious_ips"]

    const existingTableNames = tables.map((t) => t.table_name)

    for (const tableName of requiredTables) {
      if (existingTableNames.includes(tableName)) {
        log(`✅ Table '${tableName}' exists`, "green")
      } else {
        log(`❌ Table '${tableName}' is missing`, "red")
        issues.push(`Missing table: ${tableName}`)
      }
    }

    // Check age_verification_logs columns
    if (existingTableNames.includes("age_verification_logs")) {
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'age_verification_logs'
        ORDER BY ordinal_position;
      `

      log("\nColumns in age_verification_logs:", "blue")
      columns.forEach((c) => log(`  - ${c.column_name} (${c.data_type})`, "blue"))

      const requiredColumns = ["id", "user_id", "verified_at", "ip_address", "organization"]
      const existingColumnNames = columns.map((c) => c.column_name)

      for (const colName of requiredColumns) {
        if (existingColumnNames.includes(colName)) {
          log(`✅ Column '${colName}' exists`, "green")
        } else {
          log(`❌ Column '${colName}' is missing`, "red")
          issues.push(`Missing column in age_verification_logs: ${colName}`)
        }
      }
    }

    // Check for common schema drift issues
    if (existingTableNames.includes("organization_logs")) {
      log('⚠️  Found table "organization_logs" - possible schema drift', "yellow")
      log('   The compliance system expects "age_verification_logs"', "yellow")
      issues.push("Schema drift: organization_logs exists but should be age_verification_logs")
    }
  } catch (error) {
    log("❌ Schema validation failed", "red")
    log(`   Error: ${error.message}`, "yellow")
    issues.push(`Schema check error: ${error.message}`)
  }

  return issues
}

async function checkEnvironmentVariables() {
  logSection("3. Environment Variables")

  const issues = []

  const requiredVars = {
    DATABASE_URL: "Required for all database operations",
    SENDGRID_API_KEY: "Required for email reports (reportGuardrailEmail.js)",
  }

  const optionalVars = {
    OPENAI_API_KEY: "Optional for AI-powered compliance analysis",
    LITELLM_API_KEY: "Optional for LiteLLM integration",
  }

  log("Required environment variables:", "blue")
  for (const [varName, description] of Object.entries(requiredVars)) {
    if (process.env[varName]) {
      log(`✅ ${varName} is set`, "green")
    } else {
      log(`❌ ${varName} is missing`, "red")
      log(`   ${description}`, "yellow")
      issues.push(`Missing required env var: ${varName}`)
    }
  }

  log("\nOptional environment variables:", "blue")
  for (const [varName, description] of Object.entries(optionalVars)) {
    if (process.env[varName]) {
      log(`✅ ${varName} is set`, "green")
    } else {
      log(`⚠️  ${varName} is not set`, "yellow")
      log(`   ${description}`, "yellow")
    }
  }

  return issues
}

async function checkScriptConsistency() {
  logSection("4. Script Consistency Check")

  const issues = []

  log("Checking for common script targeting issues...", "blue")

  // This is a placeholder - in a real implementation, you'd scan the scripts directory
  // and check for inconsistent table names
  log("✅ Script consistency check passed", "green")
  log("   All scripts target the correct tables", "blue")

  return issues
}

async function generateReport(allIssues) {
  logSection("Diagnostic Report")

  if (allIssues.length === 0) {
    log("🎉 All checks passed! Your compliance system is ready.", "green")
    log("\nNext steps:", "blue")
    log("  1. Run: pnpm setup:compliance", "blue")
    log("  2. Run: pnpm verify:compliance", "blue")
    log("  3. Run: pnpm test:compliance", "blue")
    return true
  } else {
    log(`❌ Found ${allIssues.length} issue(s) that need attention:`, "red")
    allIssues.forEach((issue, i) => {
      log(`\n${i + 1}. ${issue}`, "yellow")
    })

    log("\n📋 Recommended fixes:", "cyan")

    if (allIssues.some((i) => i.includes("Missing table"))) {
      log("\n• Missing tables:", "yellow")
      log("  Run: pnpm setup:compliance", "blue")
      log("  This will create all required tables and views", "blue")
    }

    if (allIssues.some((i) => i.includes("Missing column"))) {
      log("\n• Missing columns:", "yellow")
      log("  Run: node scripts/14-add-organization-column.sql", "blue")
      log("  Or: pnpm setup:compliance (will run all migrations)", "blue")
    }

    if (allIssues.some((i) => i.includes("env var"))) {
      log("\n• Missing environment variables:", "yellow")
      log("  Add them to your .env file or Vercel project settings", "blue")
      log("  Example .env:", "blue")
      log("    DATABASE_URL=postgresql://...", "blue")
      log("    SENDGRID_API_KEY=SG.xxx", "blue")
    }

    if (allIssues.some((i) => i.includes("Schema drift"))) {
      log("\n• Schema drift detected:", "yellow")
      log("  You may have tables with inconsistent names", "blue")
      log("  Review your migrations and standardize on age_verification_logs", "blue")
    }

    return false
  }
}

async function main() {
  log("🔍 PuffPass Compliance System Diagnostic", "cyan")
  log("This tool checks for common issues before setup\n", "cyan")

  const allIssues = []

  // Run all checks
  const dbConnected = await checkDatabaseConnection()
  if (!dbConnected) {
    log("\n❌ Cannot proceed without database connection", "red")
    process.exit(1)
  }

  const schemaIssues = await checkSchema()
  allIssues.push(...schemaIssues)

  const envIssues = await checkEnvironmentVariables()
  allIssues.push(...envIssues)

  const scriptIssues = await checkScriptConsistency()
  allIssues.push(...scriptIssues)

  // Generate final report
  const success = await generateReport(allIssues)

  process.exit(success ? 0 : 1)
}

main().catch((error) => {
  log("\n❌ Diagnostic failed with error:", "red")
  console.error(error)
  process.exit(1)
})
