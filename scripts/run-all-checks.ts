import { execSync } from "child_process"

function run(cmd: string, description: string) {
  console.log(`\n🔄 ${description}`)
  console.log(`▶️  Running: ${cmd}`)
  try {
    execSync(`tsx ${cmd}`, { stdio: "inherit" })
    console.log(`✅ ${description} - PASSED`)
  } catch (err) {
    console.error(`❌ ${description} - FAILED`)
    console.error(`Failed command: ${cmd}`)
    process.exit(1)
  }
}

async function main() {
  console.log("🚀 Starting comprehensive system validation...\n")

  // Check if USERNAME is set for audit logging
  if (!process.env.USERNAME) {
    console.warn("⚠️  USERNAME environment variable not set. Audit logs will show 'unknown' user.")
    console.log("   To fix: export USERNAME=your-username")
  }

  // Step 1: Validate system configuration
  run("scripts/validate-system.ts", "System Configuration Validation")

  // Step 2: Quick health check
  run("scripts/quick-health-check.ts", "Quick Health Check")

  // Step 3: Detailed system status
  run("scripts/system-status.ts", "Detailed System Status")

  // Step 4: Database connection test
  run("scripts/test-database-connection.ts", "Database Connection Test")

  // Step 5: JWT system verification
  run("scripts/verify-jwt-system.ts", "JWT System Verification")

  console.log("\n🎉 All system checks passed successfully!")
  console.log("✅ System is healthy and ready for deployment.")
  console.log("\n📊 Summary:")
  console.log("   • Database connectivity: ✅")
  console.log("   • JWT rotation system: ✅")
  console.log("   • Environment variables: ✅")
  console.log("   • System health: ✅")
  console.log("   • Audit compliance: ✅")
}

main().catch((error) => {
  console.error("💥 System validation failed:", error)
  process.exit(1)
})
