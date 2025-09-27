const { neon } = require("@neondatabase/serverless")

console.log("🔍 Testing database connection...")

async function testDatabaseConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    const sql = neon(process.env.DATABASE_URL)

    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as db_version`
    console.log("✅ Database connection successful")
    console.log(`📅 Current time: ${result[0].current_time}`)
    console.log(`🗄️  Database version: ${result[0].db_version}`)

    // Test table access
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    console.log(`📊 Found ${tables.length} tables:`)
    tables.forEach((table) => {
      console.log(`  - ${table.table_name}`)
    })

    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    return false
  }
}

// Run the test
testDatabaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error("❌ Unexpected error:", error)
    process.exit(1)
  })
