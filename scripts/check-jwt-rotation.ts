// JWT Rotation Compliance Checker
// Ensures rotation happens within required timeframes

import { shouldRotateSecret, getJWTSecrets } from "../lib/jwt-rotation"

const THRESHOLD_DAYS = 90

function checkJWTRotation() {
  console.log("🔍 Checking JWT rotation compliance...")

  try {
    const secrets = getJWTSecrets()

    if (!secrets.rotationDate) {
      console.warn("⚠️  No JWT_ROTATION_DATE found - rotation tracking not enabled")
      console.log("💡 Set JWT_ROTATION_DATE environment variable to track rotations")
      return
    }

    const daysSinceRotation = Math.floor((Date.now() - secrets.rotationDate.getTime()) / (1000 * 60 * 60 * 24))

    if (shouldRotateSecret()) {
      console.error(
        `🚨 JWT secret rotation overdue! Last rotated ${daysSinceRotation} days ago (threshold: ${THRESHOLD_DAYS} days).`,
      )
      console.log("🔧 Run: npm run rotate-jwt-secret")
      process.exit(1)
    } else {
      console.log(`✅ JWT secret last rotated ${daysSinceRotation} days ago. Within compliance window.`)

      if (daysSinceRotation > 60) {
        console.log(`⏰ Rotation recommended in ${THRESHOLD_DAYS - daysSinceRotation} days`)
      }
    }
  } catch (error) {
    console.error("❌ Rotation check failed:", error)
    process.exit(1)
  }
}

// Run check if called directly
if (require.main === module) {
  checkJWTRotation()
}

export { checkJWTRotation }
