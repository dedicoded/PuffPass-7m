import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Fetching Admin Vault Summary - live data")

    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    // Get total vault balance by source
    const vaultBreakdown = await sql`
      SELECT 
        source,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        MAX(timestamp) as last_transaction
      FROM puff_vault 
      GROUP BY source
      ORDER BY total_amount DESC
    `

    // Calculate total vault balance
    const totalBalance = await sql`
      SELECT SUM(amount) as total_balance
      FROM puff_vault
    `

    // Get vault health metrics
    const vaultHealth = {
      status: (totalBalance[0]?.total_balance || 0) > 10000 ? "healthy" : "low",
      reserve_ratio: (totalBalance[0]?.total_balance || 0) / 50000, // Target $50k reserve
      fee_coverage_days: Math.floor((totalBalance[0]?.total_balance || 0) / 200), // Assuming $200/day avg coverage
    }

    const responseData = {
      total_balance: totalBalance[0]?.total_balance || 0,
      breakdown: vaultBreakdown.reduce(
        (acc, row) => {
          acc[row.source] = Number.parseFloat(row.total_amount)
          return acc
        },
        {} as Record<string, number>,
      ),
      vault_health: vaultHealth,
      last_updated: new Date().toISOString(),
    }

    console.log("[v0] Admin Vault Summary fetched successfully")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Admin Vault Summary error:", error)
    return NextResponse.json({ error: "Failed to fetch vault summary" }, { status: 500 })
  }
}
