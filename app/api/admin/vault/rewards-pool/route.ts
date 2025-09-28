import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Fetching Rewards Pool - live data")

    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    // Calculate rewards pool (10% of all merchant fees)
    const rewardsPool = await sql`
      SELECT SUM(amount) * 0.10 as rewards_pool_balance
      FROM puff_vault
      WHERE source IN ('withdrawal_fee', 'transaction_fee')
    `

    // Get total points distributed
    const pointsDistributed = await sql`
      SELECT 
        SUM(points_spent) as total_distributed,
        COUNT(*) as redemption_count
      FROM reward_redemptions
      WHERE status = 'completed'
    `

    // Get pending redemptions
    const pendingRedemptions = await sql`
      SELECT 
        SUM(points_spent) as pending_points,
        COUNT(*) as pending_count
      FROM reward_redemptions
      WHERE status = 'pending'
    `

    // Get current user points balances
    const totalUserPoints = await sql`
      SELECT SUM(total_puff_points) as total_points
      FROM user_profiles
      WHERE total_puff_points > 0
    `

    const responseData = {
      rewards_pool_balance: Number.parseFloat(rewardsPool[0]?.rewards_pool_balance || 0),
      allocation_percent: 0.1,
      lifetime_distributed: Number.parseFloat(pointsDistributed[0]?.total_distributed || 0),
      pending_redemptions: Number.parseFloat(pendingRedemptions[0]?.pending_points || 0),
      total_user_points: Number.parseFloat(totalUserPoints[0]?.total_points || 0),
      redemption_stats: {
        completed_redemptions: Number.parseInt(pointsDistributed[0]?.redemption_count || 0),
        pending_redemptions: Number.parseInt(pendingRedemptions[0]?.pending_count || 0),
      },
      last_updated: new Date().toISOString(),
    }

    console.log("[v0] Rewards Pool fetched successfully")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Rewards Pool error:", error)
    return NextResponse.json({ error: "Failed to fetch rewards pool data" }, { status: 500 })
  }
}
