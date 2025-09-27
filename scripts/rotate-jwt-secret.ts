// JWT Secret Rotation Script for Cannabis Compliance
// Run this script to perform secure JWT secret rotation

import { generateSecureSecret, getJWTSecrets } from "../lib/jwt-rotation"

async function rotateJWTSecret() {
  console.log("🔄 Starting JWT Secret Rotation for Compliance...")

  try {
    // Get current secrets
    const currentSecrets = getJWTSecrets()
    console.log("📋 Current rotation status:")
    console.log(`   - Current secret: ${currentSecrets.current ? "✅ Set" : "❌ Missing"}`)
    console.log(`   - Previous secret: ${currentSecrets.previous ? "✅ Set" : "❌ Not set"}`)
    console.log(`   - Last rotation: ${currentSecrets.rotationDate || "Never"}`)

    // Generate new secret
    const newSecret = generateSecureSecret()
    console.log("🔐 Generated new cryptographically secure secret")

    // Instructions for manual rotation
    console.log("\n📝 Manual Rotation Steps:")
    console.log("1. Set environment variables:")
    console.log(`   JWT_SECRET_PREVIOUS=${currentSecrets.current}`)
    console.log(`   JWT_SECRET=${newSecret}`)
    console.log(`   JWT_ROTATION_DATE=${new Date().toISOString()}`)

    console.log("\n2. Deploy the changes")
    console.log("3. Wait 7 days for old tokens to expire")
    console.log("4. Remove JWT_SECRET_PREVIOUS")

    console.log("\n✅ Rotation preparation complete!")
    console.log("🏛️ This rotation maintains compliance with cannabis industry security standards")
  } catch (error) {
    console.error("❌ Rotation failed:", error)
    process.exit(1)
  }
}

// Run rotation if called directly
if (require.main === module) {
  rotateJWTSecret()
}

export { rotateJWTSecret }
