import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const sql = getSql()
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get("merchantId")

    if (!merchantId) {
      return NextResponse.json({ error: "merchantId is required" }, { status: 400 })
    }

    const rewards = await sql`
      SELECT 
        id,
        name,
        description,
        points_cost,
        value_dollars,
        category,
        availability_count,
        is_active,
        created_at,
        (SELECT COUNT(*) FROM reward_redemptions WHERE reward_id = rewards_catalog.id) as redemptions_count
      FROM rewards_catalog 
      WHERE merchant_id = ${merchantId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error("[v0] Merchant rewards API error:", error)
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSql()
    const body = await request.json()
    const { name, description, points_cost, value_dollars, category, availability_count, merchant_id } = body

    const result = await sql`
      INSERT INTO rewards_catalog (
        merchant_id, name, description, points_cost, value_dollars, 
        category, availability_count, is_active
      ) VALUES (
        ${merchant_id}, ${name}, ${description}, ${points_cost}, ${value_dollars},
        ${category}, ${availability_count}, true
      )
      RETURNING *
    `

    return NextResponse.json({ reward: result[0] })
  } catch (error) {
    console.error("[v0] Create reward API error:", error)
    return NextResponse.json({ error: "Failed to create reward" }, { status: 500 })
  }
}
