import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deploymentId = searchParams.get("deployment_id")
    const since = searchParams.get("since")

    let logsQuery = `
      SELECT 
        id,
        deployment_id,
        log_type,
        log_level,
        message,
        timestamp,
        metadata
      FROM deployment_logs
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (deploymentId) {
      logsQuery += ` AND deployment_id = $${paramIndex}`
      params.push(deploymentId)
      paramIndex++
    }

    if (since) {
      logsQuery += ` AND timestamp > $${paramIndex}`
      params.push(since)
      paramIndex++
    }

    logsQuery += ` ORDER BY timestamp DESC LIMIT 100`

    const logs = await sql(logsQuery, params)

    const activeDeployments = await sql`
      SELECT 
        d.id,
        d.project_name,
        d.url as deployment_url,
        d.status,
        d.environment,
        d.branch,
        d.created_at,
        d.build_time,
        d.deploy_time
      FROM deployments d
      WHERE d.status IN ('pending', 'building')
      ORDER BY d.created_at DESC
    `

    const metrics = await sql`
      SELECT 
        dm.deployment_id,
        dm.metric_name,
        dm.metric_value,
        dm.unit,
        dm.timestamp,
        dm.metadata
      FROM deployment_metrics dm
      WHERE dm.timestamp > NOW() - INTERVAL '1 hour'
      ORDER BY dm.timestamp DESC
      LIMIT 50
    `

    const alerts = await sql`
      SELECT 
        da.id,
        da.deployment_id,
        da.alert_type,
        da.severity,
        da.title,
        da.description,
        da.is_resolved,
        da.created_at
      FROM deployment_alerts da
      WHERE da.is_resolved = false
      ORDER BY da.created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      logs,
      activeDeployments,
      metrics,
      alerts,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching monitoring data:", error)
    return NextResponse.json({ error: "Failed to fetch monitoring data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deployment_id, log_type = "runtime", log_level, message, metadata = {} } = body

    if (!deployment_id || !log_level || !message) {
      return NextResponse.json({ error: "Missing required fields: deployment_id, log_level, message" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO deployment_logs (deployment_id, log_type, log_level, message, metadata)
      VALUES (${deployment_id}, ${log_type}, ${log_level}, ${message}, ${metadata})
      RETURNING *
    `

    return NextResponse.json({ log: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating log entry:", error)
    return NextResponse.json({ error: "Failed to create log entry" }, { status: 500 })
  }
}
