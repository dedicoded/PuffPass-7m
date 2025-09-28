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

    // Get user tier info
    const tierInfo = await sql`
      SELECT 
        ut.current_tier,
        ut.tier_points,
        ut.lifetime_spent,
        up.total_puff_points
      FROM user_tiers ut
      LEFT JOIN user_profiles up ON ut.user_id = up.user_id
      WHERE ut.user_id = ${session.id}
    `

    // If no tier record exists, create one
    if (tierInfo.length === 0) {
      await sql`
        INSERT INTO user_tiers (user_id, current_tier, tier_points, lifetime_spent)
        VALUES (${session.id}, 'bronze', 0, 0)
      `
    }

    const userTier = tierInfo[0] || {
      current_tier: "bronze",
      tier_points: 0,
      lifetime_spent: 0,
      total_puff_points: 0,
    }

    // Get user achievements
    const achievements = await sql`
      SELECT * FROM user_achievements 
      WHERE user_id = ${session.id}
      ORDER BY unlocked_at DESC
    `

    // Get recent redemptions
    const redemptions = await sql`
      SELECT 
        pr.*,
        rc.name as reward_name,
        rc.category,
        rc.value_dollars
      FROM puff_redemptions pr
      JOIN rewards_catalog rc ON pr.reward_id = rc.id
      WHERE pr.user_id = ${session.id}
      ORDER BY pr.created_at DESC
      LIMIT 10
    `

    // Calculate tier progress
    const tierThresholds = {
      bronze: { min: 0, max: 500, multiplier: 1.0 },
      silver: { min: 500, max: 1500, multiplier: 1.25 },
      gold: { min: 1500, max: 5000, multiplier: 1.5 },
      platinum: { min: 5000, max: null, multiplier: 2.0 },
    }

    const currentTier = userTier.current_tier
    const nextTier =
      currentTier === "bronze"
        ? "silver"
        : currentTier === "silver"
          ? "gold"
          : currentTier === "gold"
            ? "platinum"
            : null

    const nextTierPoints = nextTier ? tierThresholds[nextTier].min : null
    const pointsToNextTier = nextTierPoints ? Math.max(0, nextTierPoints - userTier.tier_points) : 0

    return NextResponse.json({
      currentTier,
      nextTier,
      tierPoints: userTier.tier_points,
      pointsToNextTier,
      lifetimeSpent: userTier.lifetime_spent,
      totalPuffPoints: userTier.total_puff_points,
      achievements,
      recentRedemptions: redemptions,
      tierMultiplier: tierThresholds[currentTier]?.multiplier || 1.0,
    })
  } catch (error) {
    console.error("[v0] Get user rewards stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
