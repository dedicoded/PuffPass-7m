import { NextResponse } from "next/server"
import { getVaultSnapshot } from "@/lib/database"

export async function GET() {
  try {
    const snapshot = await getVaultSnapshot()

    if (!snapshot) {
      return NextResponse.json({ error: "No vault data found" }, { status: 404 })
    }

    // Calculate allocations based on current balances
    const totalFloat = Number.parseFloat(snapshot.float_balance) || 0
    const stablecoinAllocation = totalFloat * 0.6
    const fiatAllocation = totalFloat * 0.25
    const yieldAllocation = totalFloat * 0.15

    return NextResponse.json({
      total_float: snapshot.total_balance,
      allocations: {
        stablecoins: {
          amount: stablecoinAllocation,
          percentage: 60,
          apy: 2.5,
        },
        fiat: {
          amount: fiatAllocation,
          percentage: 25,
          apy: 0,
        },
        yield_strategies: {
          amount: yieldAllocation,
          percentage: 15,
          apy: 4.8,
        },
      },
      rewards_pool_balance: snapshot.rewards_pool_balance,
      merchant_contributions: snapshot.merchant_contributions,
      reserve_ratio: snapshot.reserve_ratio,
      last_updated: snapshot.last_updated,
    })
  } catch (error) {
    console.error("[v0] Vault snapshot API error:", error)
    return NextResponse.json({ error: "Failed to fetch vault snapshot" }, { status: 500 })
  }
}
