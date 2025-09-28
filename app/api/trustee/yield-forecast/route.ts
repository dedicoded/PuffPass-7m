import { NextResponse } from "next/server"
import { getYieldForecast, getVaultSnapshot } from "@/lib/database"

export async function GET() {
  try {
    const [forecast, snapshot] = await Promise.all([getYieldForecast(), getVaultSnapshot()])

    // Calculate projected monthly yield
    const totalFloat = Number.parseFloat(snapshot?.float_balance) || 0
    const avgApy = forecast.reduce(
      (sum, allocation) => sum + (allocation.avg_apy_achieved * allocation.allocation_percentage) / 100,
      0,
    )

    const monthlyYield = (totalFloat * avgApy) / 100 / 12
    const rewardsPoolBalance = Number.parseFloat(snapshot?.rewards_pool_balance) || 0
    const coverageMonths = rewardsPoolBalance > 0 ? rewardsPoolBalance / monthlyYield : 0

    return NextResponse.json({
      projected_monthly_yield: Math.round(monthlyYield * 100) / 100,
      rewards_pool_coverage_months: Math.round(coverageMonths * 10) / 10,
      current_apy: Math.round(avgApy * 100) / 100,
      allocations: forecast.map((allocation) => ({
        type: allocation.allocation_type,
        amount: allocation.allocated_amount,
        percentage: allocation.allocation_percentage,
        current_apy: allocation.current_apy,
        target_apy: allocation.target_apy,
        avg_achieved_apy: allocation.avg_apy_achieved,
      })),
      scenario_testing: {
        six_percent_growth: {
          new_float: totalFloat * 1.06,
          new_monthly_yield: (totalFloat * 1.06 * avgApy) / 100 / 12,
        },
      },
    })
  } catch (error) {
    console.error("[v0] Yield forecast API error:", error)
    return NextResponse.json({ error: "Failed to fetch yield forecast" }, { status: 500 })
  }
}
