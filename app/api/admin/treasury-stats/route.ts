import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = searchParams.get("range") || "24h"

    const sql = getSql()

    // Calculate date range
    const rangeMap: Record<string, number> = {
      "24h": 1,
      "7d": 7,
      "30d": 30,
    }
    const days = rangeMap[range] || 1

    // Get treasury stats
    const stats = await sql`
      SELECT 
        COALESCE(SUM(amount * 0.03), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN amount * 0.03 ELSE 0 END), 0) as daily_revenue,
        COUNT(DISTINCT merchant_id) as active_merchants,
        COUNT(*) as total_transactions
      FROM payments
      WHERE status = 'completed'
    `

    // Get recent transactions
    const transactions = await sql`
      SELECT 
        p.id,
        m.wallet_address as merchant,
        p.amount::text,
        (p.amount * 0.03)::text as fee,
        p.created_at as timestamp,
        'payment' as type
      FROM payments p
      INNER JOIN merchants m ON m.id = p.merchant_id
      WHERE p.created_at > NOW() - INTERVAL '${days} days'
      ORDER BY p.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({
      stats: stats[0],
      transactions,
    })
  } catch (error) {
    console.error("[v0] Failed to fetch treasury stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
