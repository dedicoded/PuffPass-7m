import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  console.log("[v0] Isolated test route called")
  return NextResponse.json({
    message: "Isolated test route working",
    timestamp: new Date().toISOString(),
  })
}
