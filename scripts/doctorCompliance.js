#!/usr/bin/env node

/**
 * Doctor Compliance - Onboarding health check for new contributors
 *
 * Verifies that a contributor's local environment is properly configured
 * for working with PuffPass compliance features.
 */

const { neon } = require("@neondatabase/serverless")

async function doctorCompliance() {
  console.log("🏥 Running PuffPass Compliance Health Check...\n")

  const checks = []
  let allPassed = true

  // Check 1: Environment variables
  console.log("📋 Checking environment variables...")
  const requiredEnvVars = ["DATABASE_URL", "SENDGRID_API_KEY"]

  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v])

  if (missingEnvVars.length === 0) {
    console.log("✅ All required environment variables are set\n")
    checks.push({ name: "Environment Variables", passed: true })
  } else {
    console.log(`❌ Missing environment variables: ${missingEnvVars.join(", ")}\n`)
    checks.push({ name: "Environment Variables", passed: false, missing: missingEnvVars })
    allPassed = false
  }

  // Check 2: Database connection
  console.log("📋 Checking database connection...")
  try {
    const sql = neon(process.env.DATABASE_URL)
    await sql`SELECT 1 as test`
    console.log("✅ Database connection successful\n")
    checks.push({ name: "Database Connection", passed: true })
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}\n`)
    checks.push({ name: "Database Connection", passed: false, error: error.message })
    allPassed = false
  }

  // Check 3: Required tables exist
  console.log("📋 Checking required tables...")
  try {
    const sql = neon(process.env.DATABASE_URL)

    const requiredTables = ["providers", "age_verification_logs"]

    const tableChecks = await Promise.all(
      requiredTables.map(async (table) => {
        try {
          const result = await sql`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = ${table}
            ) as exists
          `
          return { table, exists: result[0].exists }
        } catch (error) {
          return { table, exists: false, error: error.message }
        }
      }),
    )

    const missingTables = tableChecks.filter((t) => !t.exists)

    if (missingTables.length === 0) {
      console.log("✅ All required tables exist\n")
      checks.push({ name: "Required Tables", passed: true })
    } else {
      console.log(`❌ Missing tables: ${missingTables.map((t) => t.table).join(", ")}\n`)
      console.log("   Run: pnpm setup:compliance\n")
      checks.push({ name: "Required Tables", passed: false, missing: missingTables.map((t) => t.table) })
      allPassed = false
    }
  } catch (error) {
    console.log(`❌ Table check failed: ${error.message}\n`)
    checks.push({ name: "Required Tables", passed: false, error: error.message })
    allPassed = false
  }

  // Check 4: Required views exist
  console.log("📋 Checking compliance views...")
  try {
    const sql = neon(process.env.DATABASE_URL)

    const requiredViews = ["org_compliance_summary", "org_suspicious_ips"]

    const viewChecks = await Promise.all(
      requiredViews.map(async (view) => {
        try {
          const result = await sql`
            SELECT EXISTS (
              SELECT FROM information_schema.views 
              WHERE table_schema = 'public' 
              AND table_name = ${view}
            ) as exists
          `
          return { view, exists: result[0].exists }
        } catch (error) {
          return { view, exists: false, error: error.message }
        }
      }),
    )

    const missingViews = viewChecks.filter((v) => !v.exists)

    if (missingViews.length === 0) {
      console.log("✅ All compliance views exist\n")
      checks.push({ name: "Compliance Views", passed: true })
    } else {
      console.log(`❌ Missing views: ${missingViews.map((v) => v.view).join(", ")}\n`)
      console.log("   Run: pnpm setup:compliance\n")
      checks.push({ name: "Compliance Views", passed: false, missing: missingViews.map((v) => v.view) })
      allPassed = false
    }
  } catch (error) {
    console.log(`❌ View check failed: ${error.message}\n`)
    checks.push({ name: "Compliance Views", passed: false, error: error.message })
    allPassed = false
  }

  // Check 5: Scripts are executable
  console.log("📋 Checking compliance scripts...")
  const fs = require("fs")
  const path = require("path")

  const requiredScripts = [
    "scripts/setupCompliance.js",
    "scripts/verifyCompliance.js",
    "scripts/smokeTestCompliance.js",
    "scripts/v0SafeWrapper.js",
    "scripts/reportGuardrailEmail.js",
    "scripts/multiOrgReportGuardrail.js",
  ]

  const missingScripts = requiredScripts.filter((script) => {
    try {
      return !fs.existsSync(path.join(process.cwd(), script))
    } catch {
      return true
    }
  })

  if (missingScripts.length === 0) {
    console.log("✅ All compliance scripts are present\n")
    checks.push({ name: "Compliance Scripts", passed: true })
  } else {
    console.log(`❌ Missing scripts: ${missingScripts.join(", ")}\n`)
    checks.push({ name: "Compliance Scripts", passed: false, missing: missingScripts })
    allPassed = false
  }

  // Summary
  console.log("═══════════════════════════════════════════════════════")
  console.log("📊 Health Check Summary\n")

  checks.forEach((check) => {
    const status = check.passed ? "✅" : "❌"
    console.log(`${status} ${check.name}`)
    if (!check.passed && check.missing) {
      console.log(`   Missing: ${check.missing.join(", ")}`)
    }
    if (!check.passed && check.error) {
      console.log(`   Error: ${check.error}`)
    }
  })

  console.log("\n═══════════════════════════════════════════════════════\n")

  if (allPassed) {
    console.log("🎉 All checks passed! Your environment is ready for compliance work.\n")
    console.log("Next steps:")
    console.log("  • Run: pnpm test:compliance (to verify end-to-end)")
    console.log("  • Read: docs/compliance-setup-guide.md")
    console.log("  • Review: docs/quick-reference.md\n")
    process.exit(0)
  } else {
    console.log("⚠️  Some checks failed. Please fix the issues above.\n")
    console.log("Quick fixes:")
    console.log("  • Missing tables/views: pnpm setup:compliance")
    console.log("  • Missing env vars: Add them to your .env.local")
    console.log("  • Database connection: Check your DATABASE_URL\n")
    process.exit(1)
  }
}

doctorCompliance().catch((error) => {
  console.error("❌ Doctor compliance check failed:", error)
  process.exit(1)
})
