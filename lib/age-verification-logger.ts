import { neon } from "@neondatabase/serverless"

let sql: ReturnType<typeof neon> | null = null

function getSql() {
  if (sql === null) {
    if (!process.env.DATABASE_URL) {
      console.warn("[AGE-VERIFICATION] DATABASE_URL not set, age verification logging will be disabled")
      return null
    }
    sql = neon(process.env.DATABASE_URL)
  }
  return sql
}

interface LogAgeVerificationParams {
  userId?: string
  ip: string
  userAgent: string
  route: string
  action: "skip" | "pass" | "fail" | "challenge"
  reason?: string
  verified: boolean
  auditEvent?: Record<string, any>
}

export async function logAgeVerification({
  userId,
  ip,
  userAgent,
  route,
  action,
  reason,
  verified,
  auditEvent = {},
}: LogAgeVerificationParams) {
  const connection = getSql()

  if (!connection) {
    console.warn("[AGE-VERIFICATION] Skipping log - no database connection")
    return
  }

  try {
    await connection`
      INSERT INTO age_verification_logs (
        user_id, ip_address, user_agent, route, action, reason, verified, audit_event
      ) VALUES (
        ${userId || null},
        ${ip},
        ${userAgent},
        ${route},
        ${action},
        ${reason || null},
        ${verified},
        ${JSON.stringify(auditEvent)}
      )
    `
  } catch (error) {
    // Log error but don't block the request
    console.error("[AGE-VERIFICATION] Failed to log audit event:", error)
  }
}
