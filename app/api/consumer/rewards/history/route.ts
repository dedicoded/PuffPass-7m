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

    const transactions = await sql`
      SELECT 
        pt.id,
        pt.transaction_type,
        pt.amount,
        pt.puff_amount,
        pt.description,
        pt.status,
        pt.created_at,
        mp.business_name as merchant_name
      FROM puff_transactions pt
      LEFT JOIN merchant_profiles mp ON pt.merchant_id = mp.id
      WHERE pt.user_id = ${session.id}
      ORDER BY pt.created_at DESC
      LIMIT 20
    `

    // Get points earning summary
    const pointsSummary = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN puff_amount > 0 THEN puff_amount ELSE 0 END), 0) as total_earned,
        COALESCE(SUM(CASE WHEN puff_amount < 0 THEN ABS(puff_amount) ELSE 0 END), 0) as total_spent,
        COUNT(*) as total_transactions
      FROM puff_transactions
      WHERE user_id = ${session.id}
    `

    // Get recent redemptions with details
    const recentRedemptions = await sql`
      SELECT 
        rr.id,
        rr.points_spent,
        rr.redemption_code,
        rr.status,
        rr.redeemed_at,
        rr.fulfilled_at,
        rr.expires_at,
        rc.name as reward_name,
        rc.category,
        mp.business_name as merchant_name
      FROM reward_redemptions rr
      JOIN rewards_catalog rc ON rr.reward_id = rc.id
      LEFT JOIN merchant_profiles mp ON rc.merchant_id = mp.id
      WHERE rr.user_id = ${session.id}
      ORDER BY rr.redeemed_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      transaction_history: transactions.map((tx) => ({
        id: tx.id,
        type: tx.transaction_type,
        amount: tx.amount,
        points_change: tx.puff_amount,
        description: tx.description,
        merchant_name: tx.merchant_name,
        status: tx.status,
        date: tx.created_at,
      })),
      points_summary: {
        total_earned: pointsSummary[0]?.total_earned || 0,
        total_spent: pointsSummary[0]?.total_spent || 0,
        total_transactions: pointsSummary[0]?.total_transactions || 0,
      },
      recent_redemptions: recentRedemptions.map((redemption) => ({
        id: redemption.id,
        reward_name: redemption.reward_name,
        category: redemption.category,
        merchant_name: redemption.merchant_name,
        points_spent: redemption.points_spent,
        redemption_code: redemption.redemption_code,
        status: redemption.status,
        redeemed_at: redemption.redeemed_at,
        fulfilled_at: redemption.fulfilled_at,
        expires_at: redemption.expires_at,
      })),
    })
  } catch (error) {
    console.error("[v0] Consumer rewards history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
