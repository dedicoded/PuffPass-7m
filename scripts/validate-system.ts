import { neon } from "@neondatabase/serverless"
import { SignJWT, jwtVerify } from "jose"
import crypto from "crypto"

interface ValidationResult {
  step: string
  status: "success" | "warning" | "error"
  message: string
  details?: any
}

interface SystemValidationReport {
  timestamp: string
  operator: string
  results: ValidationResult[]
  summary: {
    passed: number
    warnings: number
    errors: number
    overallStatus: "healthy" | "needs_attention" | "critical"
  }
}

class SystemValidator {
  private sql: any
  private results: ValidationResult[] = []

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required")
    }
    this.sql = neon(process.env.DATABASE_URL)
  }

  private addResult(step: string, status: "success" | "warning" | "error", message: string, details?: any) {
    this.results.push({ step, status, message, details })

    const emoji = status === "success" ? "✅" : status === "warning" ? "⚠️" : "❌"
    console.log(`${emoji} ${step}: ${message}`)

    if (details && process.env.NODE_ENV !== "production") {
      console.log(`   Details:`, details)
    }
  }

  async validateDatabase(): Promise<boolean> {
    try {
      console.log("\n🔍 Step 1: Database Connection Test")

      // Test basic connectivity
      const result = await this.sql`SELECT NOW() as current_time, version() as db_version`

      if (!result || result.length === 0) {
        this.addResult("Database Connection", "error", "No response from database")
        return false
      }

      this.addResult("Database Connection", "success", "Connected successfully", {
        timestamp: result[0].current_time,
        version: result[0].db_version?.substring(0, 50) + "...",
      })

      // Test critical tables
      const tables = ["users", "jwt_secrets", "audit_logs"]
      for (const table of tables) {
        try {
          const count = await this.sql`SELECT COUNT(*) as count FROM ${this.sql(table)}`
          this.addResult(`Table: ${table}`, "success", `Found ${count[0].count} records`)
        } catch (error) {
          this.addResult(`Table: ${table}`, "error", `Table not accessible: ${error.message}`)
          return false
        }
      }

      return true
    } catch (error) {
      this.addResult("Database Connection", "error", `Connection failed: ${error.message}`)
      return false
    }
  }

  async checkJWTRotation(): Promise<{ needsRotation: boolean; daysUntilExpiry: number }> {
    try {
      console.log("\n🔍 Step 2: JWT Rotation Status Check")

      const secrets = await this.sql`
        SELECT secret_key, created_at, expires_at, is_active 
        FROM jwt_secrets 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (!secrets || secrets.length === 0) {
        this.addResult("JWT Secret Check", "error", "No active JWT secrets found")
        return { needsRotation: true, daysUntilExpiry: 0 }
      }

      const activeSecret = secrets[0]
      const now = new Date()
      const expiresAt = new Date(activeSecret.expires_at)
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry <= 0) {
        this.addResult("JWT Expiry Check", "error", `Secret expired ${Math.abs(daysUntilExpiry)} days ago`)
        return { needsRotation: true, daysUntilExpiry }
      } else if (daysUntilExpiry <= 7) {
        this.addResult(
          "JWT Expiry Check",
          "warning",
          `Secret expires in ${daysUntilExpiry} days - rotation recommended`,
        )
        return { needsRotation: true, daysUntilExpiry }
      } else if (daysUntilExpiry <= 30) {
        this.addResult("JWT Expiry Check", "warning", `Secret expires in ${daysUntilExpiry} days`)
        return { needsRotation: false, daysUntilExpiry }
      } else {
        this.addResult("JWT Expiry Check", "success", `Secret valid for ${daysUntilExpiry} more days`)
        return { needsRotation: false, daysUntilExpiry }
      }
    } catch (error) {
      this.addResult("JWT Rotation Check", "error", `Check failed: ${error.message}`)
      return { needsRotation: true, daysUntilExpiry: 0 }
    }
  }

  async performJWTRotation(operator = "system", reason = "automated-validation"): Promise<boolean> {
    try {
      console.log("\n🔄 Step 3: JWT Secret Rotation")

      // Generate new secret
      const newSecret = crypto.randomBytes(64).toString("hex")
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days

      // Deactivate old secrets
      await this.sql`UPDATE jwt_secrets SET is_active = false WHERE is_active = true`

      // Insert new secret
      const result = await this.sql`
        INSERT INTO jwt_secrets (secret_key, created_at, expires_at, is_active)
        VALUES (${newSecret}, ${now.toISOString()}, ${expiresAt.toISOString()}, true)
        RETURNING id, created_at, expires_at
      `

      // Log the rotation
      await this.sql`
        INSERT INTO audit_logs (action, operator, timestamp, details)
        VALUES (
          'jwt_rotation',
          ${operator},
          ${now.toISOString()},
          ${JSON.stringify({
            reason,
            new_secret_id: result[0].id,
            expires_at: result[0].expires_at,
            automated: true,
          })}
        )
      `

      this.addResult("JWT Rotation", "success", "New JWT secret generated and activated", {
        secretId: result[0].id,
        expiresAt: result[0].expires_at,
      })

      return true
    } catch (error) {
      this.addResult("JWT Rotation", "error", `Rotation failed: ${error.message}`)
      return false
    }
  }

  async verifyJWTSystem(): Promise<boolean> {
    try {
      console.log("\n🔍 Step 4: JWT System Verification")

      // Get active secret
      const secrets = await this.sql`
        SELECT secret_key FROM jwt_secrets 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (!secrets || secrets.length === 0) {
        this.addResult("JWT Verification", "error", "No active secret found for verification")
        return false
      }

      const secretKey = new TextEncoder().encode(secrets[0].secret_key)

      // Test token creation
      const testPayload = {
        sub: "test-user-id",
        email: "test@example.com",
        role: "customer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      }

      const token = await new SignJWT(testPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secretKey)

      this.addResult("JWT Creation", "success", "Test token created successfully")

      // Test token verification
      const { payload } = await jwtVerify(token, secretKey)

      if (payload.sub === testPayload.sub && payload.email === testPayload.email) {
        this.addResult("JWT Verification", "success", "Token verification successful")
        return true
      } else {
        this.addResult("JWT Verification", "error", "Token payload mismatch")
        return false
      }
    } catch (error) {
      this.addResult("JWT Verification", "error", `Verification failed: ${error.message}`)
      return false
    }
  }

  generateReport(operator: string): SystemValidationReport {
    const summary = this.results.reduce(
      (acc, result) => {
        if (result.status === "success") acc.passed++
        else if (result.status === "warning") acc.warnings++
        else acc.errors++
        return acc
      },
      { passed: 0, warnings: 0, errors: 0, overallStatus: "healthy" as const },
    )

    if (summary.errors > 0) {
      summary.overallStatus = "critical"
    } else if (summary.warnings > 0) {
      summary.overallStatus = "needs_attention"
    }

    return {
      timestamp: new Date().toISOString(),
      operator,
      results: this.results,
      summary,
    }
  }
}

async function main() {
  const operator = process.env.USER || process.env.USERNAME || "automated-system"
  const validator = new SystemValidator()

  console.log("🚀 Starting System Validation")
  console.log(`Operator: ${operator}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log("=".repeat(50))

  try {
    // Step 1: Database validation
    const dbHealthy = await validator.validateDatabase()
    if (!dbHealthy) {
      console.log("\n❌ Database validation failed. Stopping validation.")
      process.exit(1)
    }

    // Step 2: Check JWT rotation status
    const { needsRotation, daysUntilExpiry } = await validator.checkJWTRotation()

    // Step 3: Perform rotation if needed
    if (needsRotation) {
      const rotationSuccess = await validator.performJWTRotation(
        operator,
        daysUntilExpiry <= 0 ? "expired-secret" : "approaching-expiry",
      )
      if (!rotationSuccess) {
        console.log("\n❌ JWT rotation failed. Stopping validation.")
        process.exit(1)
      }
    }

    // Step 4: Verify JWT system
    const jwtHealthy = await validator.verifyJWTSystem()
    if (!jwtHealthy) {
      console.log("\n❌ JWT system verification failed.")
      process.exit(1)
    }

    // Generate final report
    const report = validator.generateReport(operator)

    console.log("\n" + "=".repeat(50))
    console.log("📊 VALIDATION SUMMARY")
    console.log("=".repeat(50))
    console.log(`Overall Status: ${report.summary.overallStatus.toUpperCase()}`)
    console.log(`Passed: ${report.summary.passed}`)
    console.log(`Warnings: ${report.summary.warnings}`)
    console.log(`Errors: ${report.summary.errors}`)

    if (report.summary.overallStatus === "healthy") {
      console.log("\n✅ System validation completed successfully!")
      console.log("Your JWT rotation system is healthy and compliant.")
    } else if (report.summary.overallStatus === "needs_attention") {
      console.log("\n⚠️ System validation completed with warnings.")
      console.log("Review the warnings above and consider taking action.")
    } else {
      console.log("\n❌ System validation failed.")
      console.log("Critical issues found. Please review and fix before deployment.")
      process.exit(1)
    }
  } catch (error) {
    console.error("\n💥 Validation failed with error:", error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { SystemValidator }
