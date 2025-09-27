import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const wallets = await sql`
      SELECT 
        id,
        wallet_address,
        currency,
        network,
        is_primary,
        created_at
      FROM user_crypto_wallets 
      WHERE user_id = ${userId}
      ORDER BY is_primary DESC, created_at DESC
    `

    return NextResponse.json({
      success: true,
      wallets,
    })
  } catch (error) {
    console.error("Error fetching wallets:", error)
    return NextResponse.json({ error: "Failed to fetch wallets" }, { status: 500 })
  }
}
