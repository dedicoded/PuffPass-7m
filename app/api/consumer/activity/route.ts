import { type NextRequest, NextResponse } from "next/server"
import { getConsumerActivity } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const activity = await getConsumerActivity(userId)

    const formattedActivity = (activity as any[]).map((item) => ({
      points: item.points,
      type: item.transaction_type,
      description: item.description,
      merchant_name: item.merchant_name,
      created_at: item.created_at,
      display_text:
        item.points > 0
          ? `+${item.points} points from ${item.description}`
          : `${item.points} points redeemed for ${item.description}`,
    }))

    return NextResponse.json(formattedActivity)
  } catch (error) {
    console.error("[v0] Consumer activity API error:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}
