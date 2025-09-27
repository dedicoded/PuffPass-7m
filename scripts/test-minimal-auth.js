const bcrypt = require("bcryptjs")

console.log("🔐 Testing minimal authentication system...")

async function testCryptoUtils() {
  try {
    console.log("🧪 Testing password hashing...")

    const testPassword = "TestPassword123!"
    const saltRounds = 12

    // Test hashing
    const hashedPassword = await bcrypt.hash(testPassword, saltRounds)
    console.log("✅ Password hashing successful")
    console.log(`🔒 Hash length: ${hashedPassword.length} characters`)

    // Test verification with correct password
    const isValidCorrect = await bcrypt.compare(testPassword, hashedPassword)
    if (!isValidCorrect) {
      throw new Error("Password verification failed for correct password")
    }
    console.log("✅ Correct password verification successful")

    // Test verification with incorrect password
    const isValidIncorrect = await bcrypt.compare("WrongPassword", hashedPassword)
    if (isValidIncorrect) {
      throw new Error("Password verification should have failed for incorrect password")
    }
    console.log("✅ Incorrect password rejection successful")

    console.log("🎉 All crypto utility tests passed!")
    return true
  } catch (error) {
    console.error("❌ Crypto utility test failed:", error.message)
    return false
  }
}

async function testRegistrationFlow() {
  try {
    console.log("📝 Testing registration flow simulation...")

    const testUser = {
      email: "test@example.com",
      password: "SecurePassword123!",
      username: "testuser",
    }

    // Simulate password hashing (what would happen in registration)
    const hashedPassword = await bcrypt.hash(testUser.password, 12)

    // Simulate user object creation
    const userRecord = {
      id: "test-user-id",
      email: testUser.email,
      username: testUser.username,
      password_hash: hashedPassword,
      created_at: new Date().toISOString(),
    }

    console.log("✅ User record simulation successful")
    console.log(`👤 User: ${userRecord.username} (${userRecord.email})`)

    // Simulate login verification
    const loginSuccess = await bcrypt.compare(testUser.password, userRecord.password_hash)
    if (!loginSuccess) {
      throw new Error("Login simulation failed")
    }

    console.log("✅ Login simulation successful")
    console.log("🎉 Registration flow test passed!")
    return true
  } catch (error) {
    console.error("❌ Registration flow test failed:", error.message)
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting minimal auth system tests...\n")

  const cryptoTest = await testCryptoUtils()
  console.log("")

  const registrationTest = await testRegistrationFlow()
  console.log("")

  if (cryptoTest && registrationTest) {
    console.log("🎉 All authentication tests passed!")
    return true
  } else {
    console.log("❌ Some authentication tests failed")
    return false
  }
}

runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error("❌ Unexpected error:", error)
    process.exit(1)
  })
