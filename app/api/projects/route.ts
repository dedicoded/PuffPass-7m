import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const projects = await sql`
      SELECT 
        p.*,
        COUNT(d.id) as deployment_count,
        MAX(d.created_at) as last_deployment,
        COUNT(CASE WHEN d.status = 'ready' THEN 1 END) as successful_deployments
      FROM projects p
      LEFT JOIN deployments d ON p.name = d.project_name
      GROUP BY p.id, p.project_id, p.name, p.repository_url, p.framework, p.created_at, p.updated_at
      ORDER BY p.created_at DESC
    `

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, name, repository_url, framework } = body

    if (!project_id || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO projects (project_id, name, repository_url, framework)
      VALUES (${project_id}, ${name}, ${repository_url || null}, ${framework || null})
      RETURNING *
    `

    return NextResponse.json({ project: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
