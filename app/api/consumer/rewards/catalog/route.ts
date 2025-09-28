import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const consumerId = searchParams.get("consumerId") || session.id

    const rewards = await sql`
      SELECT 
        rc.id as reward_id,
        rc.name,
        rc.description,
        rc.category,
        rc.points_cost,
        rc.value_dollars,
        rc.image_url,
        rc.availability_count,
        rc.is_active,
        mp.business_name as merchant_name,
        mp.id as merchant_id,
        (CASE 
          WHEN rc.availability_count IS NULL THEN true 
          WHEN rc.availability_count > 0 THEN true 
          ELSE false 
        END) as available,
        (CASE 
          WHEN rc.availability_count IS NOT NULL 
          THEN rc.availability_count 
          ELSE NULL 
        END) as remaining_count
      FROM rewards_catalog rc
      LEFT JOIN merchant_profiles mp ON rc.merchant_id = mp.id
      WHERE rc.is_active = true
      ORDER BY rc.category, rc.points_cost ASC
    `

    // Get user's current Puff Points
    const userPoints = await sql`
      SELECT COALESCE(total_puff_points, 0) as points
      FROM user_profiles 
      WHERE user_id = ${consumerId}
    `

    const currentPoints = userPoints[0]?.points || 0

    // Get user's redemption history for context
    const recentRedemptions = await sql`
      SELECT 
        rr.id,
        rr.points_spent,
        rr.redemption_code,
        rr.status,
        rr.redeemed_at,
        rc.name as reward_name
      FROM reward_redemptions rr
      JOIN rewards_catalog rc ON rr.reward_id = rc.id
      WHERE rr.user_id = ${consumerId}
      ORDER BY rr.redeemed_at DESC
      LIMIT 5
    `

    return NextResponse.json({
      available_rewards: rewards.map((reward) => ({
        reward_id: reward.reward_id,
        name: reward.name,
        description: reward.description,
        category: reward.category,
        cost_points: reward.points_cost,
        value_dollars: reward.value_dollars,
        image_url: reward.image_url,
        merchant: {
          id: reward.merchant_id,
          name: reward.merchant_name,
        },
        availability: {
          available: reward.available,
          remaining_count: reward.remaining_count,
        },
      })),
      user_context: {
        current_points: currentPoints,
        recent_redemptions: recentRedemptions,
      },
      vault_message:
        "Your rewards are powered by the Puff Vault! Merchant fees fund this ecosystem, keeping payments fee-free while rewarding your loyalty.",
    })
  } catch (error) {
    console.error("[v0] Consumer rewards catalog error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
