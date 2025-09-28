import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deployment_id = searchParams.get("deployment_id")
    const metric_type = searchParams.get("metric_type")
    const hours = Number.parseInt(searchParams.get("hours") || "24")
    const environment = searchParams.get("environment")

    let query = `
      SELECT 
        dm.deployment_id,
        dm.metric_type,
        dm.value,
        dm.unit,
        dm.timestamp,
        dm.metadata,
        d.environment,
        d.project_name
      FROM deployment_metrics dm
      JOIN deployments d ON dm.deployment_id = d.deployment_id
      WHERE dm.timestamp >= NOW() - INTERVAL '${hours} hours'
    `
    const params: any[] = []
    let paramIndex = 1

    if (deployment_id) {
      query += ` AND dm.deployment_id = $${paramIndex}`
      params.push(deployment_id)
      paramIndex++
    }

    if (metric_type) {
      query += ` AND dm.metric_type = $${paramIndex}`
      params.push(metric_type)
      paramIndex++
    }

    if (environment && environment !== "all") {
      query += ` AND d.environment = $${paramIndex}`
      params.push(environment)
      paramIndex++
    }

    query += ` ORDER BY dm.timestamp DESC`

    const metrics = await sql(query, params)

    // Aggregate metrics by type for summary
    const summary = metrics.reduce((acc: any, metric: any) => {
      const type = metric.metric_type
      if (!acc[type]) {
        acc[type] = {
          total: 0,
          count: 0,
          unit: metric.unit,
          latest: metric.value,
          latest_timestamp: metric.timestamp,
        }
      }
      acc[type].total += Number.parseFloat(metric.value)
      acc[type].count += 1
      if (new Date(metric.timestamp) > new Date(acc[type].latest_timestamp)) {
        acc[type].latest = metric.value
        acc[type].latest_timestamp = metric.timestamp
      }
      return acc
    }, {})

    return NextResponse.json({
      metrics,
      summary,
      timeRange: `${hours} hours`,
    })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deployment_id, metric_type, value, unit, metadata } = body

    if (!deployment_id || !metric_type || value === undefined || !unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO deployment_metrics (deployment_id, metric_type, value, unit, metadata)
      VALUES (${deployment_id}, ${metric_type}, ${value}, ${unit}, ${metadata || null})
      RETURNING *
    `

    return NextResponse.json({ metric: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating metric:", error)
    return NextResponse.json({ error: "Failed to create metric" }, { status: 500 })
  }
}
