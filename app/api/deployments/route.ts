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
        d.project_name,
        d.environment,
        d.status,
        d.version,
        d.commit_hash,
        d.branch,
        d.platform,
        d.url as deployment_url,
        d.build_time,
        d.deploy_time,
        d.created_at,
        d.updated_at,
        d.deployed_by,
        d.deployment_config
      FROM deployments d
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
      query += ` AND d.branch ILIKE $${paramIndex}`
      params.push(`%${branch}%`)
      paramIndex++
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const deployments = await sql(query, params)

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM deployments d WHERE 1=1"
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
      countQuery += ` AND d.branch ILIKE $${countParamIndex}`
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
      project_name,
      environment = "production",
      status = "pending",
      version,
      commit_hash,
      branch,
      platform = "vercel",
      url,
      build_time,
      deploy_time,
      deployed_by,
      deployment_config = {},
    } = body

    if (!project_name || !branch || !commit_hash) {
      return NextResponse.json({ error: "Missing required fields: project_name, branch, commit_hash" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO deployments (
        project_name, environment, status, version, commit_hash, branch,
        platform, url, build_time, deploy_time, deployed_by, deployment_config
      ) VALUES (
        ${project_name}, ${environment}, ${status}, ${version}, ${commit_hash}, ${branch},
        ${platform}, ${url}, ${build_time}, ${deploy_time}, ${deployed_by}, ${deployment_config}
      )
      RETURNING *
    `

    return NextResponse.json({ deployment: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating deployment:", error)
    return NextResponse.json({ error: "Failed to create deployment" }, { status: 500 })
  }
}
