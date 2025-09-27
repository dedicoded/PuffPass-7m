import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Build query conditions
    const conditions = ["deleted_at IS NULL"]
    const params = []

    if (role) {
      conditions.push(`(raw_json->>'role') = $${params.length + 1}`)
      params.push(role)
    }

    if (search) {
      conditions.push(`(name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`)
      params.push(`%${search}%`)
    }

    params.push(limit, offset)

    const whereClause = conditions.join(" AND ")

    const users = await sql`
      SELECT 
        id,
        name,
        email,
        (raw_json->>'role') as role,
        created_at,
        updated_at
      FROM neon_auth.users_sync
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM neon_auth.users_sync
      WHERE ${sql.unsafe(whereClause)}
    `

    return NextResponse.json({
      users,
      total: Number.parseInt(countResult[0].total),
      limit,
      offset,
    })
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
