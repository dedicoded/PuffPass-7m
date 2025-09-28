import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { is_active } = body

    const result = await sql`
      UPDATE rewards_catalog 
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 })
    }

    return NextResponse.json({ reward: result[0] })
  } catch (error) {
    console.error("[v0] Update reward API error:", error)
    return NextResponse.json({ error: "Failed to update reward" }, { status: 500 })
  }
}
