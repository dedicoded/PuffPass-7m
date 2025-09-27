import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { Web3HealthLogger } from "@/lib/web3-health-logger"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [recentMetrics, complianceSummary, healthReport] = await Promise.all([
      Web3HealthLogger.getRecentHealthMetrics(24), // Last 24 hours
      Web3HealthLogger.getComplianceSummary(),
      Web3HealthLogger.generateHealthReport(
        new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        new Date(), // Now
      ),
    ])

    // Calculate summary statistics
    const totalChecks = recentMetrics.length
    const successfulChecks = recentMetrics.filter((m) => m.status === "connected").length
    const errorChecks = recentMetrics.filter((m) => m.status === "error").length
    const unavailableChecks = recentMetrics.filter((m) => m.status === "unavailable").length

    const avgLatency =
      recentMetrics.filter((m) => m.latency_ms).reduce((sum, m) => sum + m.latency_ms, 0) /
        recentMetrics.filter((m) => m.latency_ms).length || 0

    const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0

    return NextResponse.json({
      summary: {
        totalChecks,
        successfulChecks,
        errorChecks,
        unavailableChecks,
        uptimePercentage: Math.round(uptime * 100) / 100,
        averageLatency: Math.round(avgLatency),
        lastCheckTime: recentMetrics[0]?.timestamp || null,
      },
      integrations: complianceSummary,
      recentMetrics: recentMetrics.slice(0, 20), // Last 20 checks
      healthReport,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Get Web3 health data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const startTime = Date.now()

    // Perform manual health check
    const healthCheck = await fetch("https://api.walletconnect.com/health", {
      method: "GET",
      signal: AbortSignal.timeout(10000), // 10 second timeout for manual check
    }).catch(() => null)

    const latency = Date.now() - startTime
    const isHealthy = healthCheck?.ok || false

    // Log manual health check
    await Web3HealthLogger.logHealthMetric({
      status: isHealthy ? "connected" : "error",
      latency,
      lastError: isHealthy ? undefined : "Manual health check failed",
      errorCount: isHealthy ? 0 : 1,
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
      isDemo: !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      provider: "walletconnect",
      connectionAttempts: 1,
      successfulConnections: isHealthy ? 1 : 0,
      failedConnections: isHealthy ? 0 : 1,
      operator: session.email || "admin",
      checkType: "manual",
      environment: process.env.NODE_ENV || "production",
      metadata: {
        manual_trigger: true,
        http_status: healthCheck?.status || null,
        triggered_by: session.email,
      },
    })

    return NextResponse.json({
      status: isHealthy ? "healthy" : "unhealthy",
      latency,
      timestamp: new Date().toISOString(),
      details: {
        walletconnect_api: isHealthy ? "accessible" : "unreachable",
        response_time_ms: latency,
        http_status: healthCheck?.status || null,
      },
    })
  } catch (error) {
    console.error("[v0] Manual Web3 health check error:", error)
    return NextResponse.json({ error: "Health check failed" }, { status: 500 })
  }
}
