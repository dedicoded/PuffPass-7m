import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function validateMigrations() {
  console.log("🔍 Validating database schema...")

  try {
    // Check if all required tables exist
    const requiredTables = [
      // Puff Pass core tables
      "users",
      "wallets",
      "rewards",
      "vault",
      "audit_logs",
      "user_rewards",
      "transactions",
      // Deployment tracking tables
      "deployments",
      "deployment_logs",
      "environments",
      "deployment_metrics",
      "deployment_alerts",
      "projects",
    ]

    for (const tableName of requiredTables) {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        )
      `

      if (!result[0].exists) {
        throw new Error(`Table ${tableName} does not exist`)
      }
      console.log(`✅ Table ${tableName} exists`)
    }

    // Check if indexes exist
    const indexes = await sql`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'wallets', 'rewards', 'vault', 'audit_logs', 'user_rewards', 'transactions', 'deployments', 'deployment_logs', 'environments', 'deployment_metrics', 'deployment_alerts', 'projects')
      ORDER BY tablename, indexname
    `

    console.log(`📊 Found ${indexes.length} indexes:`)
    indexes.forEach((idx) => {
      console.log(`  - ${idx.tablename}.${idx.indexname}`)
    })

    // Test basic queries and validate data integrity
    console.log("🧪 Testing basic queries...")

    const users = await sql`SELECT COUNT(*) as count FROM users`
    const wallets = await sql`SELECT COUNT(*) as count FROM wallets`
    const rewards = await sql`SELECT COUNT(*) as count FROM rewards`
    const vault = await sql`SELECT COUNT(*) as count FROM vault`
    const deployments = await sql`SELECT COUNT(*) as count FROM deployments`
    const projects = await sql`SELECT COUNT(*) as count FROM projects`
    const environments = await sql`SELECT COUNT(*) as count FROM environments`

    console.log(`📈 Data counts:`)
    console.log(`  - Users: ${users[0].count}`)
    console.log(`  - Wallets: ${wallets[0].count}`)
    console.log(`  - Rewards: ${rewards[0].count}`)
    console.log(`  - Vault entries: ${vault[0].count}`)
    console.log(`  - Deployments: ${deployments[0].count}`)
    console.log(`  - Projects: ${projects[0].count}`)
    console.log(`  - Environments: ${environments[0].count}`)

    // Validate foreign key constraints
    console.log("🔗 Validating foreign key constraints...")

    const fkConstraints = await sql`
      SELECT 
        tc.table_name, 
        tc.constraint_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name
    `

    console.log(`🔗 Found ${fkConstraints.length} foreign key constraints`)

    // Check if UUID extension is enabled
    const uuidExtension = await sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
      )
    `

    if (uuidExtension[0].exists) {
      console.log("✅ UUID extension is enabled")
    } else {
      console.warn("⚠️  UUID extension not found - some features may not work")
    }

    console.log("✅ All validations passed!")
  } catch (error) {
    console.error("❌ Validation failed:", error)
    process.exit(1)
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateMigrations()
}

export { validateMigrations }
