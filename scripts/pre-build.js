import { execSync } from "child_process"

// Pre-build validation script for MyCora/PuffPass
// Runs comprehensive checks before building the application

console.log("🚀 Running pre-build validation...\n")

// Check Node.js compatibility
try {
  execSync("node scripts/node-compatibility.js", { stdio: "inherit" })
} catch (error) {
  console.error("❌ Node.js compatibility check failed")
  process.exit(1)
}

// Check environment variables
try {
  execSync("node scripts/dev-cli.js check-env", { stdio: "inherit" })
} catch (error) {
  console.error("❌ Environment validation failed")
  process.exit(1)
}

// Validate build configuration
try {
  execSync("node scripts/dev-cli.js validate-build", { stdio: "inherit" })
} catch (error) {
  console.error("❌ Build configuration validation failed")
  process.exit(1)
}

// Check git status
console.log("\n📋 Git Status Check:")
try {
  execSync("node scripts/dev-cli.js audit-git", { stdio: "inherit" })
} catch (error) {
  console.warn("⚠️  Git audit completed with warnings")
}

console.log("\n✅ Pre-build validation completed successfully!")
console.log("🔨 Proceeding with build...\n")
