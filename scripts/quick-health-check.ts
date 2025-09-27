import { SystemValidator } from "./validate-system"

async function quickCheck() {
  console.log("⚡ Quick Health Check")
  console.log("=".repeat(30))

  const validator = new SystemValidator()

  try {
    // Just check database and JWT status without rotation
    const dbHealthy = await validator.validateDatabase()
    const { needsRotation, daysUntilExpiry } = await validator.checkJWTRotation()

    console.log("\n📊 QUICK SUMMARY")
    console.log("=".repeat(30))
    console.log(`Database: ${dbHealthy ? "✅ Healthy" : "❌ Issues"}`)
    console.log(`JWT Status: ${needsRotation ? "⚠️ Needs Rotation" : "✅ Good"} (${daysUntilExpiry} days remaining)`)

    if (dbHealthy && !needsRotation) {
      console.log("\n✅ System is healthy!")
    } else {
      console.log("\n⚠️ Run full validation: npm run validate-system")
    }
  } catch (error) {
    console.error("❌ Health check failed:", error.message)
    process.exit(1)
  }
}

quickCheck().catch(console.error)
