// Quick system health check - minimal validation for fast feedback
import { neon } from "@neondatabase/serverless"

console.log("⚡ Quick System Health Check")
console.log("─".repeat(30))

async function quickCheck() {
  const checks = []

  // Database check
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set")
    }
    const sql = neon(process.env.DATABASE_URL)
    await sql`SELECT 1`
    checks.push({ name: "Database", status: "✅", message: "Connected" })
  } catch (error) {
    checks.push({ name: "Database", status: "❌", message: error.message })
  }

  // Environment variables check
  const requiredVars = ["DATABASE_URL", "NEXTAUTH_SECRET"]
  const missingVars = requiredVars.filter((v) => !process.env[v])

  if (missingVars.length === 0) {
    checks.push({ name: "Environment", status: "✅", message: "All required vars set" })
  } else {
    checks.push({ name: "Environment", status: "❌", message: `Missing: ${missingVars.join(", ")}` })
  }

  // bcryptjs availability check
  try {
    await import("bcryptjs")
    checks.push({ name: "Auth System", status: "✅", message: "bcryptjs available" })
  } catch (error) {
    checks.push({ name: "Auth System", status: "❌", message: "bcryptjs import failed" })
  }

  // Display results
  console.log("\n📊 Health Check Results:")
  checks.forEach((check) => {
    console.log(`${check.status} ${check.name}: ${check.message}`)
  })

  const allPassed = checks.every((check) => check.status === "✅")

  console.log("\n" + "─".repeat(30))
  if (allPassed) {
    console.log("🎉 System is healthy!")
    return true
  } else {
    console.log("⚠️  System has issues - run full validation for details")
    return false
  }
}

quickCheck()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error("❌ Quick check failed:", error)
    process.exit(1)
  })
