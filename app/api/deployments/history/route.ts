import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectName = searchParams.get("project_name")
    const environment = searchParams.get("environment")
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT 
        d.id,
        d.project_name,
        d.url,
        d.status,
        d.environment,
        d.branch,
        d.commit_sha,
        d.commit_message,
        d.build_time,
        d.deploy_time,
        d.created_at,
        d.updated_at,
        COUNT(dl.id) as log_count,
        COUNT(CASE WHEN da.severity = 'critical' THEN 1 END) as critical_alerts,
        COUNT(CASE WHEN da.severity = 'warning' THEN 1 END) as warning_alerts
      FROM deployments d
      LEFT JOIN deployment_logs dl ON d.id = dl.deployment_id
      LEFT JOIN deployment_alerts da ON d.id = da.deployment_id AND da.is_resolved = false
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (projectName) {
      query += ` AND d.project_name = $${paramIndex}`
      params.push(projectName)
      paramIndex++
    }

    if (environment) {
      query += ` AND d.environment = $${paramIndex}`
      params.push(environment)
      paramIndex++
    }

    if (status) {
      query += ` AND d.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += `
      GROUP BY d.id, d.project_name, d.url, d.status, d.environment, d.branch, 
               d.commit_sha, d.commit_message, d.build_time, d.deploy_time, 
               d.created_at, d.updated_at
      ORDER BY d.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(limit, offset)

    const deployments = await sql(query, params)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM deployments d
      WHERE 1=1
    `
    const countParams: any[] = []
    let countParamIndex = 1

    if (projectName) {
      countQuery += ` AND d.project_name = $${countParamIndex}`
      countParams.push(projectName)
      countParamIndex++
    }

    if (environment) {
      countQuery += ` AND d.environment = $${countParamIndex}`
      countParams.push(environment)
      countParamIndex++
    }

    if (status) {
      countQuery += ` AND d.status = $${countParamIndex}`
      countParams.push(status)
      countParamIndex++
    }

    const countResult = await sql(countQuery, countParams)
    const total = Number.parseInt(countResult[0]?.total || "0")

    return NextResponse.json({
      deployments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("Error fetching deployment history:", error)
    return NextResponse.json({ error: "Failed to fetch deployment history" }, { status: 500 })
  }
}
