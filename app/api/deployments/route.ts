import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const environment = searchParams.get("environment")
    const status = searchParams.get("status")
    const branch = searchParams.get("branch")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT 
        d.id,
        d.deployment_url,
        d.branch_name,
        d.commit_hash,
        d.commit_message,
        d.status,
        d.environment,
        d.build_time_seconds,
        d.deployed_by,
        d.created_at,
        d.completed_at,
        p.name as project_name,
        p.repository_url
      FROM deployments d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (environment && environment !== "all") {
      query += ` AND d.environment = $${paramIndex}`
      params.push(environment)
      paramIndex++
    }

    if (status && status !== "all") {
      query += ` AND d.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (branch && branch !== "all") {
      query += ` AND d.branch_name ILIKE $${paramIndex}`
      params.push(`%${branch}%`)
      paramIndex++
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const deployments = await sql(query, params)

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM deployments d LEFT JOIN projects p ON d.project_id = p.id WHERE 1=1"
    const countParams: any[] = []
    let countParamIndex = 1

    if (environment && environment !== "all") {
      countQuery += ` AND d.environment = $${countParamIndex}`
      countParams.push(environment)
      countParamIndex++
    }

    if (status && status !== "all") {
      countQuery += ` AND d.status = $${countParamIndex}`
      countParams.push(status)
      countParamIndex++
    }

    if (branch && branch !== "all") {
      countQuery += ` AND d.branch_name ILIKE $${countParamIndex}`
      countParams.push(`%${branch}%`)
      countParamIndex++
    }

    const [{ total }] = await sql(countQuery, countParams)

    return NextResponse.json({
      deployments,
      pagination: {
        total: Number.parseInt(total),
        limit,
        offset,
        hasMore: offset + limit < Number.parseInt(total),
      },
    })
  } catch (error) {
    console.error("Error fetching deployments:", error)
    return NextResponse.json({ error: "Failed to fetch deployments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      project_id,
      deployment_url,
      branch_name,
      commit_hash,
      commit_message,
      status = "building",
      environment = "preview",
      build_time_seconds,
      deployed_by,
    } = body

    if (!project_id || !branch_name || !commit_hash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO deployments (
        project_id, deployment_url, branch_name, commit_hash, commit_message,
        status, environment, build_time_seconds, deployed_by
      ) VALUES (
        ${project_id}, ${deployment_url}, ${branch_name}, ${commit_hash}, ${commit_message},
        ${status}, ${environment}, ${build_time_seconds}, ${deployed_by}
      )
      RETURNING *
    `

    return NextResponse.json({ deployment: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating deployment:", error)
    return NextResponse.json({ error: "Failed to create deployment" }, { status: 500 })
  }
}
