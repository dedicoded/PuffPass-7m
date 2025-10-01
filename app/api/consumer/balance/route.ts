import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Consumer balance API called - minimal version")

  return NextResponse.json({
    total_points: 0,
    total_spent: 0,
    value_estimate: 0,
    current_tier: "Green Puffer",
    next_tier: "Gold Puffer",
    points_to_next_tier: 500,
    transaction_count: 0,
    message: "Consumer balance API is working",
  })
}
