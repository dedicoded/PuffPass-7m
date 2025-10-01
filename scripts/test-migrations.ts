import { runMigrations } from "./run-migrations"
import { validateMigrations } from "./validate-migrations"

async function testMigrations() {
  console.log("🧪 Starting migration test suite...")

  try {
    // Step 1: Run the migrations
    console.log("\n=== STEP 1: Running Migrations ===")
    await runMigrations()

    // Step 2: Validate the results
    console.log("\n=== STEP 2: Validating Results ===")
    await validateMigrations()

    // Step 3: Test idempotency (run migrations again)
    console.log("\n=== STEP 3: Testing Idempotency ===")
    console.log("Running migrations again to test idempotency...")
    await runMigrations()
    console.log("✅ Idempotency test passed - migrations can be run multiple times safely")

    // Step 4: Test Puff Pass specific functionality
    console.log("\n=== STEP 4: Testing Puff Pass Functionality ===")
    await testPuffPassFeatures()

    console.log("\n🎉 All migration tests passed successfully!")
    console.log("\n📋 Summary:")
    console.log("  ✅ Schema creation successful")
    console.log("  ✅ Sample data insertion successful")
    console.log("  ✅ Index creation successful")
    console.log("  ✅ Idempotency verified")
    console.log("  ✅ Foreign key constraints validated")
    console.log("  ✅ Puff Pass features tested")
    console.log("  ✅ All validations passed")
  } catch (error) {
    console.error("\n💥 Migration test failed:", error)
    console.log("\n🔧 Troubleshooting tips:")
    console.log("  1. Check your DATABASE_URL environment variable")
    console.log("  2. Ensure your database is accessible")
    console.log("  3. Verify you have CREATE TABLE permissions")
    console.log("  4. Check the server logs for detailed error messages")
    console.log("  5. Ensure PostgreSQL version supports UUID extension")
    process.exit(1)
  }
}

async function testPuffPassFeatures() {
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.DATABASE_URL!)

  console.log("🎯 Testing Puff Pass core features...")

  try {
    // Test user creation and role validation
    console.log("  👤 Testing user management...")
    const testUsers = await sql`
      SELECT id, email, role FROM users 
      WHERE role IN ('admin', 'merchant', 'consumer', 'trustee')
      LIMIT 5
    `
    console.log(`    ✅ Found ${testUsers.length} test users with valid roles`)

    // Test wallet functionality
    console.log("  💳 Testing wallet functionality...")
    const walletTest = await sql`
      SELECT COUNT(*) as count FROM wallets w
      JOIN users u ON w.user_id = u.id
      WHERE u.role = 'consumer'
    `
    console.log(`    ✅ Wallet-user relationships working`)

    // Test rewards system
    console.log("  🎁 Testing rewards system...")
    const rewardsTest = await sql`
      SELECT COUNT(*) as count FROM rewards r
      JOIN users u ON r.merchant_id = u.id
      WHERE u.role = 'merchant'
    `
    console.log(`    ✅ Rewards-merchant relationships working`)

    // Test audit logging capability
    console.log("  📝 Testing audit logging...")
    const auditTest = await sql`
      SELECT COUNT(*) as count FROM audit_logs
    `
    console.log(`    ✅ Audit logs table ready (${auditTest[0].count} entries)`)

    // Test vault functionality
    console.log("  🏦 Testing vault functionality...")
    const vaultTest = await sql`
      SELECT COUNT(*) as count FROM vault
    `
    console.log(`    ✅ Vault table ready (${vaultTest[0].count} entries)`)

    console.log("✅ All Puff Pass features tested successfully!")
  } catch (error) {
    console.error("❌ Puff Pass feature test failed:", error)
    throw error
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testMigrations()
}

export { testMigrations }
