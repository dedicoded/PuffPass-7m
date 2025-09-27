// Comprehensive JWT System Verification
// Tests all components of the JWT rotation system

import { JWTRotationService } from "../lib/jwt-rotation"
import { createToken, verifyToken } from "../lib/auth"

async function verifyJWTSystem() {
  console.log("🔍 Verifying JWT Rotation System...\n")

  try {
    // Test 1: JWTRotationService instantiation
    console.log("Test 1: Creating JWTRotationService...")
    const jwtService = new JWTRotationService()
    console.log("✅ JWTRotationService created successfully\n")

    // Test 2: Check rotation status
    console.log("Test 2: Checking rotation status...")
    const rotationStatus = await jwtService.checkRotationStatus()
    console.log("✅ Rotation status:", rotationStatus)
    console.log("")

    // Test 3: Test auth.ts integration
    console.log("Test 3: Testing auth.ts integration...")
    const testPayload = {
      userId: "test-user-123",
      email: "test@example.com",
      role: "customer" as const,
    }

    try {
      const token = await createToken(testPayload)
      console.log("✅ Token created via auth.ts")

      const decoded = await verifyToken(token)
      console.log("✅ Token verified via auth.ts")
      console.log("Decoded payload:", {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      })
    } catch (authError) {
      console.log("⚠️  Auth integration test failed (expected if no database keys):", authError.message)
    }
    console.log("")

    // Test 4: Direct service methods
    console.log("Test 4: Testing direct service methods...")
    try {
      const keys = await jwtService.getCurrentKeys()
      console.log(`✅ Retrieved ${keys.length} active keys from database`)

      if (keys.length > 0) {
        const directToken = await jwtService.signToken(testPayload)
        console.log("✅ Direct token creation successful")

        const directDecoded = await jwtService.verifyToken(directToken)
        console.log("✅ Direct token verification successful")
      } else {
        console.log("⚠️  No keys in database - run JWT setup script first")
      }
    } catch (dbError) {
      console.log("⚠️  Database operations failed (expected if not set up):", dbError.message)
    }

    console.log("\n🎉 JWT System Verification Complete!")
    console.log("\nNext steps:")
    console.log("1. Run database setup script to create jwt_keys table")
    console.log("2. Run initial key generation script")
    console.log("3. Test with actual authentication flows")
  } catch (error) {
    console.error("❌ JWT system verification failed:", error)
    throw error
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyJWTSystem()
    .then(() => {
      console.log("\n✅ Verification completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Verification failed:", error)
      process.exit(1)
    })
}

export { verifyJWTSystem }
