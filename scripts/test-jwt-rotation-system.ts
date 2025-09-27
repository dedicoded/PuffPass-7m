import { neon } from "@neondatabase/serverless"
import { JWTRotationService } from "../lib/jwt-rotation"

const sql = neon(process.env.DATABASE_URL!)

async function testJWTRotationSystem() {
  console.log("🔄 Testing JWT Rotation System...\n")

  try {
    // Initialize the JWT rotation service
    const jwtService = new JWTRotationService()

    // Test 1: Check if we can get current keys
    console.log("Test 1: Getting current JWT keys...")
    const currentKeys = await jwtService.getCurrentKeys()
    console.log(`✅ Found ${currentKeys.length} active keys`)

    // Test 2: Create a test token
    console.log("\nTest 2: Creating test token...")
    const testPayload = { userId: "test-user-123", email: "test@example.com" }
    const token = await jwtService.signToken(testPayload)
    console.log("✅ Token created successfully")

    // Test 3: Verify the token
    console.log("\nTest 3: Verifying test token...")
    const decoded = await jwtService.verifyToken(token)
    console.log("✅ Token verified successfully")
    console.log("Decoded payload:", decoded)

    // Test 4: Check rotation status
    console.log("\nTest 4: Checking rotation status...")
    const rotationStatus = await jwtService.checkRotationStatus()
    console.log("Rotation status:", rotationStatus)

    // Test 5: Database connection test
    console.log("\nTest 5: Testing database connection...")
    const result = await sql`SELECT COUNT(*) as count FROM jwt_keys WHERE is_active = true`
    console.log(`✅ Database connection successful. Active keys: ${result[0].count}`)

    console.log("\n🎉 All JWT rotation system tests passed!")
  } catch (error) {
    console.error("❌ JWT rotation system test failed:", error)
    throw error
  }
}

// Run the test
testJWTRotationSystem()
  .then(() => {
    console.log("\n✅ JWT rotation system is working correctly")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ JWT rotation system test failed:", error)
    process.exit(1)
  })
