import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params
    const sql = getSql()

    const merchant = await sql`
      SELECT 
        m.id,
        m.wallet_address,
        m.business_name,
        m.category,
        COALESCE(SUM(CASE WHEN p.settled_at IS NULL THEN p.amount * 0.97 ELSE 0 END), 0) as vault_balance,
        COALESCE(SUM(p.amount * 0.97), 0) as total_received
      FROM merchants m
      LEFT JOIN payments p ON p.merchant_id = m.id AND p.status = 'completed'
      WHERE m.wallet_address = ${address}
      GROUP BY m.id, m.wallet_address, m.business_name, m.category
    `

    if (merchant.length === 0) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    return NextResponse.json(merchant[0])
  } catch (error) {
    console.error("[v0] Failed to fetch merchant:", error)
    return NextResponse.json({ error: "Failed to fetch merchant" }, { status: 500 })
  }
}
