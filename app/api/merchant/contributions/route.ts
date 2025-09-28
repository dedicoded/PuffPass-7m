import { type NextRequest, NextResponse } from "next/server"
import { getMerchantContributions } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get("merchantId")

    if (!merchantId) {
      return NextResponse.json({ error: "merchantId is required" }, { status: 400 })
    }

    const contributions = await getMerchantContributions(merchantId)

    return NextResponse.json({
      vault_contribution: contributions.total_vault_contribution,
      rewards_funded: contributions.total_rewards_funded,
      transaction_count: contributions.transaction_count,
      fee_free_payments_enabled: Math.floor(contributions.total_vault_contribution / 2.5), // Estimate based on avg transaction
    })
  } catch (error) {
    console.error("[v0] Merchant contributions API error:", error)
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 })
  }
}
