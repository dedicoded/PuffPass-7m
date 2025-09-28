import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Fetching Merchant Contributions - live data")

    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    // Get merchant contributions from puff_vault table
    const merchantContributions = await sql`
      SELECT 
        merchant_id,
        SUM(amount) as total_fees,
        SUM(CASE WHEN source = 'withdrawal_fee' THEN amount ELSE 0 END) as withdrawal_fees,
        SUM(CASE WHEN source = 'transaction_fee' THEN amount ELSE 0 END) as transaction_fees,
        MAX(timestamp) as last_activity,
        COUNT(*) as contribution_count
      FROM puff_vault 
      WHERE merchant_id IS NOT NULL
      GROUP BY merchant_id
      ORDER BY total_fees DESC
    `

    // Get total contributions
    const totalContributions = await sql`
      SELECT SUM(amount) as total
      FROM puff_vault
      WHERE merchant_id IS NOT NULL
    `

    const responseData = {
      total_contributions: totalContributions[0]?.total || 0,
      merchants: merchantContributions.map((row) => ({
        merchant_id: row.merchant_id,
        total_fees: Number.parseFloat(row.total_fees),
        withdrawal_fees: Number.parseFloat(row.withdrawal_fees),
        transaction_fees: Number.parseFloat(row.transaction_fees),
        last_activity: row.last_activity,
        contribution_count: Number.parseInt(row.contribution_count),
      })),
      last_updated: new Date().toISOString(),
    }

    console.log("[v0] Merchant Contributions fetched successfully")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Merchant Contributions error:", error)
    return NextResponse.json({ error: "Failed to fetch merchant contributions" }, { status: 500 })
  }
}
