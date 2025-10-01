import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"
import { join } from "path"

const sql = neon(process.env.DATABASE_URL!)

interface MigrationScript {
  filename: string
  content: string
  order: number
}

async function runMigrations() {
  console.log("🚀 Starting database migrations...")

  try {
    // Test database connection first
    console.log("📡 Testing database connection...")
    await sql`SELECT NOW() as current_time`
    console.log("✅ Database connection successful")

    // Define migration scripts in order
    const migrationFiles: MigrationScript[] = [
      {
        filename: "001-create-puffpass-schema.sql",
        content: readFileSync(join(process.cwd(), "scripts", "001-create-puffpass-schema.sql"), "utf-8"),
        order: 1,
      },
      {
        filename: "002-create-deployment-schema.sql",
        content: readFileSync(join(process.cwd(), "scripts", "002-create-deployment-schema.sql"), "utf-8"),
        order: 2,
      },
      {
        filename: "003-seed-sample-data.sql",
        content: readFileSync(join(process.cwd(), "scripts", "003-seed-sample-data.sql"), "utf-8"),
        order: 3,
      },
    ]

    // Run each migration script
    for (const migration of migrationFiles) {
      console.log(`📝 Running migration: ${migration.filename}`)

      try {
        // Better SQL statement parsing that handles PostgreSQL syntax
        const statements = migration.content
          .split(/;\s*(?=\n|$)/) // Split on semicolon followed by newline or end
          .map((stmt) => stmt.trim())
          .filter((stmt) => {
            // Filter out empty statements and comments
            return stmt.length > 0 && !stmt.startsWith("--") && !stmt.match(/^\s*$/) && stmt !== ";"
          })

        console.log(`  📊 Found ${statements.length} statements to execute`)

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i]
          if (statement.trim()) {
            try {
              console.log(`  ⚡ Executing statement ${i + 1}/${statements.length}`)
              await sql.unsafe(statement)
            } catch (stmtError) {
              console.error(`  ❌ Statement ${i + 1} failed:`, statement.substring(0, 100) + "...")
              console.error(`  💥 Error:`, stmtError)
              throw stmtError
            }
          }
        }

        console.log(`✅ Migration ${migration.filename} completed successfully`)
      } catch (error) {
        console.error(`❌ Migration ${migration.filename} failed:`, error)
        throw error
      }
    }

    // Verify tables were created
    console.log("🔍 Verifying table creation...")
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'wallets', 'rewards', 'vault', 'audit_logs', 'user_rewards', 'transactions', 'deployments', 'deployment_logs', 'environments', 'deployment_metrics', 'deployment_alerts', 'projects')
      ORDER BY table_name
    `

    console.log("📊 Created tables:", tables.map((t) => t.table_name).join(", "))

    // Check sample data
    const userCount = await sql`SELECT COUNT(*) as count FROM users`
    const rewardCount = await sql`SELECT COUNT(*) as count FROM rewards`
    const deploymentCount = await sql`SELECT COUNT(*) as count FROM deployments`
    const projectCount = await sql`SELECT COUNT(*) as count FROM projects`

    console.log(
      `📈 Sample data: ${userCount[0].count} users, ${rewardCount[0].count} rewards, ${deploymentCount[0].count} deployments, ${projectCount[0].count} projects`,
    )

    console.log("🎉 All migrations completed successfully!")
  } catch (error) {
    console.error("💥 Migration failed:", error)
    process.exit(1)
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations()
}

export { runMigrations }
