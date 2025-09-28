import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized - Merchant access required" }, { status: 401 })
    }

    // Get merchant's published rewards
    const merchantRewards = await sql`
      SELECT 
        id, name, description, category, points_cost, 
        value_dollars, availability_count, is_active,
        created_at, updated_at
      FROM rewards_catalog 
      WHERE merchant_id = ${session.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      rewards: merchantRewards,
      total_rewards: merchantRewards.length,
      active_rewards: merchantRewards.filter((r) => r.is_active).length,
    })
  } catch (error) {
    console.error("[v0] Get merchant rewards catalog error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized - Merchant access required" }, { status: 401 })
    }

    const { name, description, category, points_cost, value_dollars, availability_count } = await request.json()

    // Create new merchant reward
    const newReward = await sql`
      INSERT INTO rewards_catalog (
        merchant_id, name, description, category, 
        points_cost, value_dollars, availability_count, is_active
      )
      VALUES (
        ${session.id}, ${name}, ${description}, ${category},
        ${points_cost}, ${value_dollars}, ${availability_count || null}, true
      )
      RETURNING *
    `

    console.log("[v0] Merchant reward created successfully")
    return NextResponse.json({
      success: true,
      reward: newReward[0],
      message: "Reward added to catalog successfully",
    })
  } catch (error) {
    console.error("[v0] Create merchant reward error:", error)
    return NextResponse.json({ error: "Failed to create reward" }, { status: 500 })
  }
}
