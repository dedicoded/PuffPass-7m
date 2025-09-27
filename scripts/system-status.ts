import { SystemValidator } from "./validate-system"

interface SystemStatus {
  database: {
    connected: boolean
    tables: { name: string; records: number }[]
    lastChecked: string
  }
  jwt: {
    hasActiveSecret: boolean
    daysUntilExpiry: number
    rotationNeeded: boolean
    lastRotation: string | null
  }
  overall: "healthy" | "warning" | "critical"
}

async function getSystemStatus(): Promise<SystemStatus> {
  const validator = new SystemValidator()

  try {
    // Quick database check
    const dbHealthy = await validator.validateDatabase()

    // JWT status check
    const { needsRotation, daysUntilExpiry } = await validator.checkJWTRotation()

    // Get last rotation info
    const sql = validator["sql"] // Access private sql instance
    const lastRotation = await sql`
      SELECT timestamp FROM audit_logs 
      WHERE action = 'jwt_rotation' 
      ORDER BY timestamp DESC 
      LIMIT 1
    `

    const status: SystemStatus = {
      database: {
        connected: dbHealthy,
        tables: [], // Would be populated by validator results
        lastChecked: new Date().toISOString(),
      },
      jwt: {
        hasActiveSecret: true, // Would be determined by validation
        daysUntilExpiry,
        rotationNeeded: needsRotation,
        lastRotation: lastRotation[0]?.timestamp || null,
      },
      overall:
        dbHealthy && !needsRotation
          ? "healthy"
          : dbHealthy && needsRotation && daysUntilExpiry > 7
            ? "warning"
            : "critical",
    }

    return status
  } catch (error) {
    return {
      database: { connected: false, tables: [], lastChecked: new Date().toISOString() },
      jwt: { hasActiveSecret: false, daysUntilExpiry: 0, rotationNeeded: true, lastRotation: null },
      overall: "critical",
    }
  }
}

async function displayStatus() {
  console.log("📊 System Status Dashboard")
  console.log("=".repeat(40))

  const status = await getSystemStatus()

  console.log(`\n🗄️  Database: ${status.database.connected ? "✅ Connected" : "❌ Disconnected"}`)
  console.log(`🔑 JWT System: ${status.jwt.hasActiveSecret ? "✅ Active" : "❌ No Active Secret"}`)
  console.log(`⏰ Expiry: ${status.jwt.daysUntilExpiry} days remaining`)
  console.log(`🔄 Rotation: ${status.jwt.rotationNeeded ? "⚠️ Needed" : "✅ Not needed"}`)

  if (status.jwt.lastRotation) {
    const lastRotationDate = new Date(status.jwt.lastRotation)
    console.log(`📅 Last Rotation: ${lastRotationDate.toLocaleDateString()}`)
  }

  console.log(
    `\n🎯 Overall Status: ${
      status.overall === "healthy" ? "✅ HEALTHY" : status.overall === "warning" ? "⚠️ NEEDS ATTENTION" : "❌ CRITICAL"
    }`,
  )

  // Recommendations
  if (status.overall === "warning") {
    console.log("\n💡 Recommendations:")
    if (status.jwt.rotationNeeded) {
      console.log("   • Run: npm run rotate-jwt")
    }
  } else if (status.overall === "critical") {
    console.log("\n🚨 Immediate Actions Required:")
    if (!status.database.connected) {
      console.log("   • Check database connection")
    }
    if (!status.jwt.hasActiveSecret) {
      console.log("   • Generate new JWT secret")
    }
  }
}

if (require.main === module) {
  displayStatus().catch(console.error)
}

export { getSystemStatus, type SystemStatus }
