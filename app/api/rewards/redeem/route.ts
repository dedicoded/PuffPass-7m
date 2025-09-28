import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rewardId } = await request.json()

    // Start transaction
    await sql`BEGIN`

    try {
      // Get reward details
      const reward = await sql`
        SELECT * FROM rewards_catalog 
        WHERE id = ${rewardId} AND is_active = true
      `

      if (reward.length === 0) {
        await sql`ROLLBACK`
        return NextResponse.json({ error: "Reward not found" }, { status: 404 })
      }

      const rewardItem = reward[0]

      // Check availability
      if (rewardItem.availability_count !== null && rewardItem.availability_count <= 0) {
        await sql`ROLLBACK`
        return NextResponse.json({ error: "Reward no longer available" }, { status: 400 })
      }

      // Get user's current points
      const userProfile = await sql`
        SELECT total_puff_points FROM user_profiles 
        WHERE user_id = ${session.id}
      `

      const currentPoints = userProfile[0]?.total_puff_points || 0

      if (currentPoints < rewardItem.points_cost) {
        await sql`ROLLBACK`
        return NextResponse.json({ error: "Insufficient points" }, { status: 400 })
      }

      // Generate redemption code
      const redemptionCode = `PUFF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      // Set expiration (30 days from now for most rewards)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      // Create redemption record
      const redemption = await sql`
        INSERT INTO puff_redemptions (
          user_id, reward_id, points_spent, redemption_code, expires_at
        ) VALUES (
          ${session.id}, ${rewardId}, ${rewardItem.points_cost}, ${redemptionCode}, ${expiresAt.toISOString()}
        ) RETURNING *
      `

      // Deduct points from user
      await sql`
        UPDATE user_profiles 
        SET total_puff_points = total_puff_points - ${rewardItem.points_cost},
            updated_at = NOW()
        WHERE user_id = ${session.id}
      `

      // Add negative points transaction record
      await sql`
        INSERT INTO puff_points (
          user_id, points, transaction_type, description, created_at
        ) VALUES (
          ${session.id}, ${-rewardItem.points_cost}, 'redemption', 
          'Redeemed: ${rewardItem.name}', NOW()
        )
      `

      // Update availability count if limited
      if (rewardItem.availability_count !== null) {
        await sql`
          UPDATE rewards_catalog 
          SET availability_count = availability_count - 1,
              updated_at = NOW()
          WHERE id = ${rewardId}
        `
      }

      // Update rewards pool balance
      if (rewardItem.value_dollars > 0) {
        await sql`
          UPDATE puff_vault_rewards_pool 
          SET total_redeemed = total_redeemed + ${rewardItem.value_dollars},
              available_balance = available_balance - ${rewardItem.value_dollars},
              last_updated = NOW()
        `
      }

      await sql`COMMIT`

      return NextResponse.json({
        success: true,
        redemption: redemption[0],
        redemptionCode,
        message: `Successfully redeemed ${rewardItem.name}!`,
      })
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }
  } catch (error) {
    console.error("[v0] Redeem reward error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
