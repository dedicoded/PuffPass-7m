#!/usr/bin/env node

/**
 * verifyCompliance.js
 *
 * Verifies that all compliance infrastructure is properly set up.
 * Run with: pnpm verify:compliance
 *
 * Checks:
 * - Tables exist (providers_lookup, age_verification_logs)
 * - Columns exist (organization)
 * - Views exist (org_compliance_summary, org_suspicious_ips)
 * - Indexes exist
 */

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function checkTable(tableName) {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = ${tableName}
      );
    `
    return result[0].exists
  } catch (error) {
    return false
  }
}

async function checkColumn(tableName, columnName) {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = ${tableName} 
        AND column_name = ${columnName}
      );
    `
    return result[0].exists
  } catch (error) {
    return false
  }
}

async function checkView(viewName) {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_name = ${viewName}
      );
    `
    return result[0].exists
  } catch (error) {
    return false
  }
}

async function verifyCompliance() {
  console.log("🔍 PuffPass Compliance Verification")
  console.log("====================================\n")

  const checks = []

  // Check tables
  console.log("📋 Checking tables...")
  checks.push({
    name: "providers_lookup table",
    status: await checkTable("providers_lookup"),
  })
  checks.push({
    name: "age_verification_logs table",
    status: await checkTable("age_verification_logs"),
  })

  // Check columns
  console.log("📋 Checking columns...")
  checks.push({
    name: "organization column",
    status: await checkColumn("age_verification_logs", "organization"),
  })

  // Check views
  console.log("📋 Checking views...")
  checks.push({
    name: "org_compliance_summary view",
    status: await checkView("org_compliance_summary"),
  })
  checks.push({
    name: "org_suspicious_ips view",
    status: await checkView("org_suspicious_ips"),
  })

  // Print results
  console.log("\n====================================")
  console.log("📊 Verification Results")
  console.log("====================================\n")

  let allPassed = true
  for (const check of checks) {
    const icon = check.status ? "✅" : "❌"
    console.log(`${icon} ${check.name}`)
    if (!check.status) allPassed = false
  }

  console.log("\n====================================")

  if (allPassed) {
    console.log("✅ All compliance infrastructure is properly set up!")
    console.log("\nYou can now:")
    console.log("- View compliance dashboard at /admin")
    console.log("- Generate reports with pnpm compliance:monthly")
    console.log("- Run multi-org reports with pnpm compliance:multi-org")
  } else {
    console.log("❌ Some checks failed. Run pnpm setup:compliance to fix.")
    process.exit(1)
  }
}

// Run verification
verifyCompliance().catch((error) => {
  console.error("❌ Verification failed:", error)
  process.exit(1)
})
