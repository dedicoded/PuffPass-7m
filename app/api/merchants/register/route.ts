import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, businessName, category } = await req.json()

    if (!walletAddress || !businessName || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = getSql()

    // Check if merchant already exists
    const existing = await sql`
      SELECT id FROM merchants WHERE wallet_address = ${walletAddress}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Merchant already registered" }, { status: 409 })
    }

    // Insert new merchant
    const result = await sql`
      INSERT INTO merchants (wallet_address, business_name, category, created_at)
      VALUES (${walletAddress}, ${businessName}, ${category}, NOW())
      RETURNING id, wallet_address, business_name, category
    `

    return NextResponse.json({ success: true, merchant: result[0] })
  } catch (error) {
    console.error("[v0] Merchant registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
