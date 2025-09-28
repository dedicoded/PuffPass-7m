import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Fetching Float Management - live data")

    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    // Get total float (user balances not yet spent)
    const totalFloat = await sql`
      SELECT SUM(balance) as total_float
      FROM user_profiles
      WHERE balance > 0
    `

    // Get float allocation breakdown (simulated for demo)
    const floatBalance = Number.parseFloat(totalFloat[0]?.total_float || 0)
    const stablecoinAllocation = floatBalance * 0.7 // 70% in stablecoins
    const fiatReserves = floatBalance * 0.25 // 25% in fiat
    const yieldDeployment = floatBalance * 0.05 // 5% in yield strategies

    // Calculate projected yield (3% APY on deployed amount)
    const projectedMonthlyYield = (yieldDeployment * 0.03) / 12

    const responseData = {
      total_float: floatBalance,
      allocations: {
        stablecoins: stablecoinAllocation,
        fiat_reserves: fiatReserves,
        yield_deployment: yieldDeployment,
      },
      yield_metrics: {
        current_apy: 0.03,
        projected_monthly_yield: projectedMonthlyYield,
        projected_annual_yield: projectedMonthlyYield * 12,
      },
      float_utilization: {
        utilization_rate: floatBalance > 0 ? yieldDeployment / floatBalance : 0,
        target_utilization: 0.05,
        available_for_deployment: Math.max(0, floatBalance * 0.1 - yieldDeployment),
      },
      last_updated: new Date().toISOString(),
    }

    console.log("[v0] Float Management fetched successfully")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Float Management error:", error)
    return NextResponse.json({ error: "Failed to fetch float management data" }, { status: 500 })
  }
}
