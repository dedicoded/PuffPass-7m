import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectName = searchParams.get("project_name")
    const isActive = searchParams.get("is_active")

    let query = `
      SELECT 
        id,
        project_name,
        name,
        description,
        variables,
        is_active,
        created_at,
        updated_at
      FROM environments
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (projectName) {
      query += ` AND project_name = $${paramIndex}`
      params.push(projectName)
      paramIndex++
    }

    if (isActive !== null) {
      query += ` AND is_active = $${paramIndex}`
      params.push(isActive === "true")
      paramIndex++
    }

    query += ` ORDER BY project_name, name`

    const environments = await sql(query, params)

    return NextResponse.json({ environments })
  } catch (error) {
    console.error("Error fetching environments:", error)
    return NextResponse.json({ error: "Failed to fetch environments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_name, name, description, variables = {}, is_active = true } = body

    if (!project_name || !name) {
      return NextResponse.json({ error: "Missing required fields: project_name, name" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO environments (project_name, name, description, variables, is_active)
      VALUES (${project_name}, ${name}, ${description}, ${variables}, ${is_active})
      RETURNING *
    `

    return NextResponse.json({ environment: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating environment:", error)
    return NextResponse.json({ error: "Failed to create environment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, project_name, name, description, variables, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 })
    }

    const result = await sql`
      UPDATE environments 
      SET 
        project_name = COALESCE(${project_name}, project_name),
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        variables = COALESCE(${variables}, variables),
        is_active = COALESCE(${is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Environment not found" }, { status: 404 })
    }

    return NextResponse.json({ environment: result[0] })
  } catch (error) {
    console.error("Error updating environment:", error)
    return NextResponse.json({ error: "Failed to update environment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM environments 
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Environment not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Environment deleted successfully" })
  } catch (error) {
    console.error("Error deleting environment:", error)
    return NextResponse.json({ error: "Failed to delete environment" }, { status: 500 })
  }
}
