import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Puff balance API called - MINIMAL VERSION")

  return NextResponse.json({
    balance: 100,
    currency: "PUFF",
    test: true,
  })
}
