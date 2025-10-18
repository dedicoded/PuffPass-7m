import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT 
        id,
        user_wallet,
        puff_amount,
        usdc_amount,
        tx_hash,
        status,
        created_at
      FROM puff_redemptions
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ redemptions: result.rows })
  } catch (error: any) {
    console.error("[v0] Get redemption history error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch redemption history",
      },
      { status: 500 },
    )
  }
}
