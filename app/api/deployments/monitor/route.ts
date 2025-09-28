import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deploymentId = searchParams.get("deployment_id")
    const since = searchParams.get("since")

    // Get recent deployment logs
    let logsQuery = `
      SELECT 
        id,
        deployment_id,
        log_level,
        message,
        timestamp
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
        d.deployment_url,
        d.project_id,
        d.status,
        d.environment,
        d.branch_name,
        d.created_at,
        p.name as project_name
      FROM deployments d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.status = 'building'
      ORDER BY d.created_at DESC
    `

    // Get recent metrics
    const metrics = await sql`
      SELECT 
        dm.deployment_id,
        dm.metric_name,
        dm.metric_value,
        dm.unit,
        dm.recorded_at
      FROM deployment_metrics dm
      WHERE dm.recorded_at > NOW() - INTERVAL '1 hour'
      ORDER BY dm.recorded_at DESC
      LIMIT 50
    `

    return NextResponse.json({
      logs,
      activeDeployments,
      metrics,
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
    const { deployment_id, log_level, message } = body

    if (!deployment_id || !log_level || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO deployment_logs (deployment_id, log_level, message)
      VALUES (${deployment_id}, ${log_level}, ${message})
      RETURNING *
    `

    return NextResponse.json({ log: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating log entry:", error)
    return NextResponse.json({ error: "Failed to create log entry" }, { status: 500 })
  }
}
