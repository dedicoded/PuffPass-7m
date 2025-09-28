import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const environment = searchParams.get("environment") || "all"
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    // Get deployment statistics
    const deploymentStats = await sql`
      SELECT 
        COUNT(*) as total_deployments,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as successful_deployments,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_deployments,
        AVG(build_time) as avg_build_time,
        COUNT(CASE WHEN environment = 'production' THEN 1 END) as production_deployments,
        COUNT(CASE WHEN environment = 'preview' THEN 1 END) as preview_deployments
      FROM deployments 
      WHERE created_at >= NOW() - INTERVAL '${hours} hours'
      ${environment !== "all" ? sql`AND environment = ${environment}` : sql``}
    `

    // Get metrics aggregation
    const metricsAgg = await sql`
      SELECT 
        dm.metric_type,
        SUM(dm.value) as total_value,
        AVG(dm.value) as avg_value,
        MAX(dm.value) as max_value,
        MIN(dm.value) as min_value,
        dm.unit
      FROM deployment_metrics dm
      JOIN deployments d ON dm.deployment_id = d.deployment_id
      WHERE dm.timestamp >= NOW() - INTERVAL '${hours} hours'
      ${environment !== "all" ? sql`AND d.environment = ${environment}` : sql``}
      GROUP BY dm.metric_type, dm.unit
    `

    // Get hourly deployment trends
    const deploymentTrends = await sql`
      SELECT 
        DATE_TRUNC('hour', created_at) as hour,
        COUNT(*) as deployment_count,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as successful_count,
        AVG(build_time) as avg_build_time
      FROM deployments 
      WHERE created_at >= NOW() - INTERVAL '${hours} hours'
      ${environment !== "all" ? sql`AND environment = ${environment}` : sql``}
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY hour DESC
    `

    // Get error rate by hour
    const errorTrends = await sql`
      SELECT 
        DATE_TRUNC('hour', dl.timestamp) as hour,
        COUNT(*) as total_logs,
        COUNT(CASE WHEN dl.level = 'error' THEN 1 END) as error_count,
        COUNT(CASE WHEN dl.level = 'warn' THEN 1 END) as warning_count
      FROM deployment_logs dl
      JOIN deployments d ON dl.deployment_id = d.deployment_id
      WHERE dl.timestamp >= NOW() - INTERVAL '${hours} hours'
      ${environment !== "all" ? sql`AND d.environment = ${environment}` : sql``}
      GROUP BY DATE_TRUNC('hour', dl.timestamp)
      ORDER BY hour DESC
    `

    // Calculate success rate
    const stats = deploymentStats[0]
    const successRate =
      stats.total_deployments > 0 ? ((stats.successful_deployments / stats.total_deployments) * 100).toFixed(2) : "0.00"

    return NextResponse.json({
      overview: {
        totalDeployments: Number.parseInt(stats.total_deployments),
        successfulDeployments: Number.parseInt(stats.successful_deployments),
        failedDeployments: Number.parseInt(stats.failed_deployments),
        successRate: Number.parseFloat(successRate),
        avgBuildTime: Number.parseFloat(stats.avg_build_time || 0),
        productionDeployments: Number.parseInt(stats.production_deployments),
        previewDeployments: Number.parseInt(stats.preview_deployments),
      },
      metrics: metricsAgg.reduce((acc: any, metric: any) => {
        acc[metric.metric_type] = {
          total: Number.parseFloat(metric.total_value),
          average: Number.parseFloat(metric.avg_value),
          max: Number.parseFloat(metric.max_value),
          min: Number.parseFloat(metric.min_value),
          unit: metric.unit,
        }
        return acc
      }, {}),
      trends: {
        deployments: deploymentTrends,
        errors: errorTrends,
      },
      timeRange: `${hours} hours`,
      environment,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
