import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all active rewards from catalog
    const rewards = await sql`
      SELECT 
        id,
        name,
        description,
        category,
        points_cost,
        value_dollars,
        image_url,
        availability_count,
        (CASE WHEN availability_count IS NULL THEN true 
              ELSE availability_count > 0 END) as available
      FROM rewards_catalog 
      WHERE is_active = true
      ORDER BY category, points_cost ASC
    `

    // Get user's current points
    const userPoints = await sql`
      SELECT COALESCE(total_puff_points, 0) as points
      FROM user_profiles 
      WHERE user_id = ${session.id}
    `

    const currentPoints = userPoints[0]?.points || 0

    return NextResponse.json({
      rewards,
      currentPoints,
      categories: ["discount", "event", "product", "merch"],
    })
  } catch (error) {
    console.error("[v0] Get rewards catalog error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
