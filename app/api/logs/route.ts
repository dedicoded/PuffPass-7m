import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deployment_id = searchParams.get("deployment_id")
    const level = searchParams.get("level")
    const source = searchParams.get("source")
    const hours = Number.parseInt(searchParams.get("hours") || "24")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT 
        dl.id,
        dl.deployment_id,
        dl.level,
        dl.message,
        dl.timestamp,
        dl.source,
        dl.metadata,
        d.project_name,
        d.environment
      FROM deployment_logs dl
      JOIN deployments d ON dl.deployment_id = d.deployment_id
      WHERE dl.timestamp >= NOW() - INTERVAL '${hours} hours'
    `
    const params: any[] = []
    let paramIndex = 1

    if (deployment_id) {
      query += ` AND dl.deployment_id = $${paramIndex}`
      params.push(deployment_id)
      paramIndex++
    }

    if (level && level !== "all") {
      query += ` AND dl.level = $${paramIndex}`
      params.push(level)
      paramIndex++
    }

    if (source) {
      query += ` AND dl.source = $${paramIndex}`
      params.push(source)
      paramIndex++
    }

    query += ` ORDER BY dl.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const logs = await sql(query, params)

    // Get log level counts
    let countQuery = `
      SELECT 
        dl.level,
        COUNT(*) as count
      FROM deployment_logs dl
      JOIN deployments d ON dl.deployment_id = d.deployment_id
      WHERE dl.timestamp >= NOW() - INTERVAL '${hours} hours'
    `
    const countParams: any[] = []
    let countParamIndex = 1

    if (deployment_id) {
      countQuery += ` AND dl.deployment_id = $${countParamIndex}`
      countParams.push(deployment_id)
      countParamIndex++
    }

    if (source) {
      countQuery += ` AND dl.source = $${countParamIndex}`
      countParams.push(source)
      countParamIndex++
    }

    countQuery += ` GROUP BY dl.level`

    const levelCounts = await sql(countQuery, countParams)

    return NextResponse.json({
      logs,
      levelCounts: levelCounts.reduce((acc: any, item: any) => {
        acc[item.level] = Number.parseInt(item.count)
        return acc
      }, {}),
      timeRange: `${hours} hours`,
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deployment_id, level, message, source, metadata } = body

    if (!deployment_id || !level || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO deployment_logs (deployment_id, level, message, source, metadata)
      VALUES (${deployment_id}, ${level}, ${message}, ${source || null}, ${metadata || null})
      RETURNING *
    `

    return NextResponse.json({ log: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating log:", error)
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 })
  }
}
