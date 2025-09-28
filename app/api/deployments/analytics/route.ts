import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "7d"
    const environment = searchParams.get("environment")

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (timeRange) {
      case "1d":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Build base query conditions
    let whereClause = "WHERE d.created_at >= $1"
    const params: any[] = [startDate.toISOString()]
    let paramIndex = 2

    if (environment && environment !== "all") {
      whereClause += ` AND d.environment = $${paramIndex}`
      params.push(environment)
      paramIndex++
    }

    // Get deployment statistics
    const deploymentStats = await sql(
      `
      SELECT 
        COUNT(*) as total_deployments,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as successful_deployments,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_deployments,
        COUNT(CASE WHEN status = 'building' THEN 1 END) as building_deployments,
        AVG(CASE WHEN build_time_seconds IS NOT NULL THEN build_time_seconds END) as avg_build_time,
        MIN(CASE WHEN build_time_seconds IS NOT NULL THEN build_time_seconds END) as min_build_time,
        MAX(CASE WHEN build_time_seconds IS NOT NULL THEN build_time_seconds END) as max_build_time
      FROM deployments d
      ${whereClause}
    `,
      params,
    )

    // Get deployments by environment
    const deploymentsByEnvironment = await sql(
      `
      SELECT 
        environment,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed
      FROM deployments d
      ${whereClause}
      GROUP BY environment
      ORDER BY count DESC
    `,
      params,
    )

    // Get deployments by day
    const deploymentsByDay = await sql(
      `
      SELECT 
        DATE(d.created_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed
      FROM deployments d
      ${whereClause}
      GROUP BY DATE(d.created_at)
      ORDER BY date DESC
      LIMIT 30
    `,
      params,
    )

    // Get top contributors
    const topContributors = await sql(
      `
      SELECT 
        deployed_by,
        COUNT(*) as deployment_count,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as successful_count,
        AVG(CASE WHEN build_time_seconds IS NOT NULL THEN build_time_seconds END) as avg_build_time
      FROM deployments d
      ${whereClause}
      AND deployed_by IS NOT NULL
      GROUP BY deployed_by
      ORDER BY deployment_count DESC
      LIMIT 10
    `,
      params,
    )

    // Get branch activity
    const branchActivity = await sql(
      `
      SELECT 
        branch_name,
        COUNT(*) as deployment_count,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as successful_count,
        MAX(d.created_at) as last_deployment
      FROM deployments d
      ${whereClause}
      GROUP BY branch_name
      ORDER BY deployment_count DESC
      LIMIT 15
    `,
      params,
    )

    // Get build time trends
    const buildTimeTrends = await sql(
      `
      SELECT 
        DATE(d.created_at) as date,
        AVG(build_time_seconds) as avg_build_time,
        MIN(build_time_seconds) as min_build_time,
        MAX(build_time_seconds) as max_build_time
      FROM deployments d
      ${whereClause}
      AND build_time_seconds IS NOT NULL
      GROUP BY DATE(d.created_at)
      ORDER BY date DESC
      LIMIT 30
    `,
      params,
    )

    // Get recent failures with details
    const recentFailures = await sql(
      `
      SELECT 
        d.id,
        d.deployment_id,
        d.branch_name,
        d.commit_hash,
        d.commit_message,
        d.environment,
        d.created_at,
        d.deployed_by,
        p.name as project_name
      FROM deployments d
      LEFT JOIN projects p ON d.project_id = p.id
      ${whereClause}
      AND d.status = 'error'
      ORDER BY d.created_at DESC
      LIMIT 10
    `,
      params,
    )

    // Get performance metrics
    const performanceMetrics = await sql(
      `
      SELECT 
        dm.metric_name,
        AVG(dm.metric_value) as avg_value,
        MIN(dm.metric_value) as min_value,
        MAX(dm.metric_value) as max_value,
        dm.unit
      FROM deployment_metrics dm
      JOIN deployments d ON dm.deployment_id = d.id
      ${whereClause.replace("d.created_at", "dm.recorded_at")}
      GROUP BY dm.metric_name, dm.unit
      ORDER BY dm.metric_name
    `,
      params,
    )

    return NextResponse.json({
      timeRange,
      environment,
      stats: deploymentStats[0],
      deploymentsByEnvironment,
      deploymentsByDay,
      topContributors,
      branchActivity,
      buildTimeTrends,
      recentFailures,
      performanceMetrics,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching deployment analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
