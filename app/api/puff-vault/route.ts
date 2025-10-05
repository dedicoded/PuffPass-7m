import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching Puff Vault treasury data")

    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const sql = getSql()

    // Get total vault balance by source
    const vaultSummary = await sql`
      SELECT 
        source,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        MAX(timestamp) as last_transaction
      FROM puff_vault 
      GROUP BY source
      ORDER BY total_amount DESC
    `

    // Get recent vault transactions
    const recentTransactions = await sql`
      SELECT 
        id, source, amount, merchant_id, transaction_id, 
        description, timestamp
      FROM puff_vault 
      ORDER BY timestamp DESC 
      LIMIT 50
    `

    // Calculate total vault balance
    const totalBalance = await sql`
      SELECT SUM(amount) as total_balance
      FROM puff_vault
    `

    // Get monthly fee revenue trends
    const monthlyRevenue = await sql`
      SELECT 
        DATE_TRUNC('month', timestamp) as month,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM puff_vault 
      WHERE timestamp >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', timestamp)
      ORDER BY month DESC
    `

    const responseData = {
      total_balance: totalBalance[0]?.total_balance || 0,
      summary_by_source: vaultSummary || [],
      recent_transactions: recentTransactions || [],
      monthly_revenue: monthlyRevenue || [],
      vault_health: {
        status: totalBalance[0]?.total_balance > 1000 ? "healthy" : "low",
        reserve_ratio: (totalBalance[0]?.total_balance || 0) / 10000, // Target $10k reserve
        fee_coverage_days: Math.floor((totalBalance[0]?.total_balance || 0) / 50), // Assuming $50/day avg coverage
      },
    }

    console.log("[v0] Puff Vault data fetched successfully")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Puff Vault fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch vault data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const { action, amount, source, description } = await request.json()

    if (action === "add_reserve") {
      const sql = getSql()

      // Add manual reserve funds
      await sql`
        INSERT INTO puff_vault (source, amount, description)
        VALUES (${source || "manual_reserve"}, ${amount}, ${description || "Manual reserve addition"})
      `

      return NextResponse.json({
        success: true,
        message: `Added $${amount} to Puff Vault reserves`,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Puff Vault operation error:", error)
    return NextResponse.json({ error: "Failed to process vault operation" }, { status: 500 })
  }
}
