import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Transactions API called - minimal version")

  return NextResponse.json({
    transactions: [],
    message: "Transactions API is working",
  })
}
