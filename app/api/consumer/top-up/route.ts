import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, walletAddress } = await request.json()

    // In real implementation, this would integrate with payment processor
    const pointsEarned = Math.floor(amount * 2) // 2 points per dollar

    // Record transaction
    await sql`
      INSERT INTO transactions (user_id, type, amount, points_earned, wallet_address, status)
      VALUES (${userId}, 'top_up', ${amount}, ${pointsEarned}, ${walletAddress}, 'completed')
    `

    // Update user balance
    await sql`
      UPDATE users 
      SET puff_points = puff_points + ${pointsEarned}
      WHERE id = ${userId}
    `

    // Log activity
    await sql`
      INSERT INTO user_activity (user_id, type, points, description, display_text)
      VALUES (${userId}, 'earn', ${pointsEarned}, 'Top-up payment', 'Earned ${pointsEarned} points from $${amount} top-up')
    `

    return NextResponse.json({
      success: true,
      pointsEarned,
      message: `Successfully topped up $${amount} and earned ${pointsEarned} Puff Points`,
    })
  } catch (error) {
    console.error("[v0] Top-up error:", error)
    return NextResponse.json({ error: "Failed to process top-up" }, { status: 500 })
  }
}
