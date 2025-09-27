import fs from "fs"

// Post-build validation script for MyCora/PuffPass
// Verifies build output and deployment readiness

console.log("🔍 Running post-build validation...\n")

// Check if .next directory exists and has required files
const nextDir = ".next"
const requiredFiles = [".next/BUILD_ID", ".next/static", ".next/server"]

let buildValid = true

requiredFiles.forEach((file) => {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing build file: ${file}`)
    buildValid = false
  }
})

if (buildValid) {
  console.log("✅ Build output validation passed")

  // Check build size
  try {
    const stats = fs.statSync(".next")
    console.log(`📊 Build directory size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
  } catch (error) {
    console.warn("⚠️  Could not determine build size")
  }

  console.log("🚀 Application is ready for deployment!")
} else {
  console.error("❌ Build validation failed")
  process.exit(1)
}
