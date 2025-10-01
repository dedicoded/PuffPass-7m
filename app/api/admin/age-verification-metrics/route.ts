import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Fetch all metrics in parallel
    const [passFailRate, topRoutes, suspiciousIps, dailyTrends, hourlyPattern, userAgents, recentLogs] =
      await Promise.all([
        sql`SELECT * FROM age_verification_pass_fail_rate`,
        sql`SELECT * FROM age_verification_top_routes`,
        sql`SELECT * FROM age_verification_suspicious_ips`,
        sql`SELECT * FROM age_verification_daily_trends LIMIT 30`,
        sql`SELECT * FROM age_verification_hourly_pattern`,
        sql`SELECT * FROM age_verification_user_agents LIMIT 20`,
        sql`
        SELECT 
          id,
          user_id,
          ip_address,
          route,
          action,
          reason,
          verified,
          created_at
        FROM age_verification_logs
        ORDER BY created_at DESC
        LIMIT 100
      `,
      ])

    // Calculate summary statistics
    const totalEvents = await sql`SELECT COUNT(*) as count FROM age_verification_logs`
    const last24Hours = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN action = 'pass' THEN 1 END) as passes,
        COUNT(CASE WHEN action = 'fail' THEN 1 END) as failures
      FROM age_verification_logs
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `

    return NextResponse.json({
      summary: {
        total_events: Number(totalEvents[0].count),
        last_24h: {
          total: Number(last24Hours[0].total),
          passes: Number(last24Hours[0].passes),
          failures: Number(last24Hours[0].failures),
        },
      },
      passFailRate,
      topRoutes,
      suspiciousIps,
      dailyTrends,
      hourlyPattern,
      userAgents,
      recentLogs,
    })
  } catch (error) {
    console.error("Failed to fetch age verification metrics:", error)
    return NextResponse.json({ error: "Failed to fetch age verification metrics" }, { status: 500 })
  }
}
