import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const deployment = await sql`
      SELECT 
        deployment_id,
        project_name,
        branch,
        commit_hash,
        commit_message,
        status,
        environment,
        url,
        created_at,
        deployed_at,
        build_time,
        author_name,
        author_email
      FROM deployments
      WHERE deployment_id = ${id}
    `

    if (deployment.length === 0) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 })
    }

    return NextResponse.json({ deployment: deployment[0] })
  } catch (error) {
    console.error("Error fetching deployment:", error)
    return NextResponse.json({ error: "Failed to fetch deployment" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { status, deployed_at, build_time, url } = body

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (status) {
      updates.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (deployed_at) {
      updates.push(`deployed_at = $${paramIndex}`)
      values.push(deployed_at)
      paramIndex++
    }

    if (build_time !== undefined) {
      updates.push(`build_time = $${paramIndex}`)
      values.push(build_time)
      paramIndex++
    }

    if (url) {
      updates.push(`url = $${paramIndex}`)
      values.push(url)
      paramIndex++
    }

    updates.push(`updated_at = NOW()`)

    if (updates.length === 1) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    values.push(id)
    const query = `
      UPDATE deployments 
      SET ${updates.join(", ")} 
      WHERE deployment_id = $${paramIndex}
      RETURNING *
    `

    const result = await sql(query, values)

    if (result.length === 0) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 })
    }

    return NextResponse.json({ deployment: result[0] })
  } catch (error) {
    console.error("Error updating deployment:", error)
    return NextResponse.json({ error: "Failed to update deployment" }, { status: 500 })
  }
}
