import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const sql = await getSql()

    // Get redemption contract stats (would come from blockchain in production)
    const redemptionStats = {
      contract_address: process.env.NEXT_PUBLIC_REDEMPTION_CONTRACT_ADDRESS || "0x...",
      vault_balance_usdc: 15000, // Mock data - would query blockchain
      total_redeemed_puff: 500000,
      total_usdc_paid: 5000,
      redemption_rate: 100, // 100 PUFF = $1 USDC
      is_paused: false,
    }

    // Get recent redemptions from database
    const recentRedemptions = await sql`
      SELECT 
        id, user_id, puff_amount, usdc_amount, 
        transaction_hash, status, created_at
      FROM puff_redemptions 
      ORDER BY created_at DESC 
      LIMIT 50
    `

    // Get redemption trends
    const monthlyRedemptions = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(puff_amount) as total_puff,
        SUM(usdc_amount) as total_usdc,
        COUNT(*) as redemption_count
      FROM puff_redemptions 
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `

    return NextResponse.json({
      contract_stats: redemptionStats,
      recent_redemptions: recentRedemptions || [],
      monthly_trends: monthlyRedemptions || [],
    })
  } catch (error) {
    console.error("[v0] Redemption stats fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch redemption stats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const { action, amount } = await request.json()

    if (action === "fund_vault") {
      // In production, this would trigger a blockchain transaction
      // For now, we'll just log it
      console.log(`[v0] Admin funding vault with ${amount} USDC`)

      return NextResponse.json({
        success: true,
        message: `Vault funded with $${amount} USDC`,
        transaction_hash: "0x..." + Math.random().toString(36).substring(7),
      })
    }

    if (action === "pause_redemptions") {
      console.log("[v0] Admin pausing redemptions")
      return NextResponse.json({
        success: true,
        message: "Redemptions paused",
      })
    }

    if (action === "unpause_redemptions") {
      console.log("[v0] Admin unpausing redemptions")
      return NextResponse.json({
        success: true,
        message: "Redemptions resumed",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Redemption operation error:", error)
    return NextResponse.json({ error: "Failed to process redemption operation" }, { status: 500 })
  }
}
