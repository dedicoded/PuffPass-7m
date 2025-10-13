import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql, getProviderId } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rewardId } = await request.json()

    if (!rewardId) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 })
    }

    const sql = await getSql()

    // Start transaction
    await sql`BEGIN`

    try {
      // Get reward details and check availability
      const reward = await sql`
        SELECT 
          rc.*,
          mp.business_name as merchant_name
        FROM rewards_catalog rc
        LEFT JOIN merchant_profiles mp ON rc.merchant_id = mp.id
        WHERE rc.id = ${rewardId} AND rc.is_active = true
      `

      if (reward.length === 0) {
        await sql`ROLLBACK`
        return NextResponse.json({ error: "Reward not found or inactive" }, { status: 404 })
      }

      const rewardData = reward[0]

      // Check availability
      if (rewardData.availability_count !== null && rewardData.availability_count <= 0) {
        await sql`ROLLBACK`
        return NextResponse.json({ error: "Reward is out of stock" }, { status: 400 })
      }

      // Get user's current points
      const userPoints = await sql`
        SELECT COALESCE(total_puff_points, 0) as points
        FROM user_profiles 
        WHERE user_id = ${session.id}
      `

      const currentPoints = userPoints[0]?.points || 0

      if (currentPoints < rewardData.points_cost) {
        await sql`ROLLBACK`
        return NextResponse.json(
          {
            error: `Insufficient points. You need ${rewardData.points_cost - currentPoints} more points.`,
          },
          { status: 400 },
        )
      }

      // Generate unique redemption code
      const redemptionCode = `PUFF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      await sql`
        INSERT INTO reward_redemptions (
          user_id, 
          reward_id, 
          points_spent, 
          redemption_code,
          status
        ) VALUES (
          ${session.id}, 
          ${rewardId}, 
          ${rewardData.points_cost}, 
          ${redemptionCode},
          'pending'
        )
      `

      // Deduct points from user
      await sql`
        UPDATE user_profiles 
        SET total_puff_points = total_puff_points - ${rewardData.points_cost}
        WHERE user_id = ${session.id}
      `

      // Update availability count if limited
      if (rewardData.availability_count !== null) {
        await sql`
          UPDATE rewards_catalog 
          SET availability_count = availability_count - 1
          WHERE id = ${rewardId}
        `
      }

      await sql`
        INSERT INTO puff_transactions (
          user_id,
          transaction_type,
          amount,
          puff_amount,
          description,
          status,
          provider_id
        ) VALUES (
          ${session.id},
          'reward',
          ${rewardData.value_dollars || 0},
          ${-rewardData.points_cost},
          'Redeemed: ${rewardData.name}',
          'completed',
          ${await getProviderId("system")}
        )
      `

      await sql`COMMIT`

      return NextResponse.json({
        success: true,
        message: `Successfully redeemed ${rewardData.name}!`,
        redemptionCode,
        reward: {
          name: rewardData.name,
          merchant: rewardData.merchant_name,
          value: rewardData.value_dollars,
        },
        pointsRemaining: currentPoints - rewardData.points_cost,
      })
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }
  } catch (error) {
    console.error("[v0] Reward redemption error:", error)
    return NextResponse.json({ error: "Failed to redeem reward" }, { status: 500 })
  }
}
