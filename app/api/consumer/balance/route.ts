import { type NextRequest, NextResponse } from "next/server"
import { getConsumerBalance } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const balance = await getConsumerBalance(userId)

    // Calculate tier progress (example tiers)
    const tiers = [
      { name: "Green Puffer", min: 0, max: 499 },
      { name: "Gold Puffer", min: 500, max: 1499 },
      { name: "Platinum Puffer", min: 1500, max: 4999 },
      { name: "Diamond Puffer", min: 5000, max: Number.POSITIVE_INFINITY },
    ]

    const currentTier =
      tiers.find((tier) => balance.total_points >= tier.min && balance.total_points <= tier.max) || tiers[0]

    const nextTier = tiers[tiers.indexOf(currentTier) + 1]
    const pointsToNext = nextTier ? nextTier.min - balance.total_points : 0

    return NextResponse.json({
      total_points: balance.total_points,
      value_estimate: Math.floor(balance.total_points * 0.05 * 100) / 100, // $0.05 per point
      current_tier: currentTier.name,
      next_tier: nextTier?.name || "Max Tier Reached",
      points_to_next_tier: Math.max(0, pointsToNext),
      transaction_count: balance.transaction_count,
    })
  } catch (error) {
    console.error("[v0] Consumer balance API error:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
