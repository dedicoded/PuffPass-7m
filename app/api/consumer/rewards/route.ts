import { type NextRequest, NextResponse } from "next/server"
import { getConsumerRewards } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const rewards = await getConsumerRewards("")

    const formattedRewards = rewards.map((reward) => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      points_cost: reward.points_cost,
      value_dollars: reward.value_dollars,
      merchant_name: reward.merchant_name,
      category: reward.category,
      image_url: reward.image_url,
      availability_count: reward.availability_count,
    }))

    return NextResponse.json(formattedRewards)
  } catch (error) {
    console.error("[v0] Consumer rewards API error:", error)
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
  }
}
