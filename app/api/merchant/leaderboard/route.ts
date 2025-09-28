import { NextResponse } from "next/server"
import { getMerchantLeaderboard } from "@/lib/database"

export async function GET() {
  try {
    const leaderboard = await getMerchantLeaderboard()

    const formattedLeaderboard = leaderboard.map((merchant, index) => ({
      rank: index + 1,
      merchant_name: merchant.business_name,
      merchant_id: merchant.merchant_id,
      fees_paid: merchant.fees_paid,
      points_funded: merchant.points_funded,
      redemptions_driven: merchant.redemptions_driven,
      badge: index === 0 ? "Top Contributor 🌿" : index < 3 ? "Top 3 🏆" : null,
    }))

    return NextResponse.json(formattedLeaderboard)
  } catch (error) {
    console.error("[v0] Merchant leaderboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
