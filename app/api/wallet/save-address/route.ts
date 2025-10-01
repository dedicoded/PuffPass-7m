import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, walletAddress, network } = await request.json()

    // Check if user exists and update wallet address
    const result = await sql`
      UPDATE users 
      SET wallet_address = ${walletAddress}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, wallet_address
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] Wallet address saved successfully for user:", userId)

    return NextResponse.json({
      success: true,
      message: "Wallet connected successfully",
      walletAddress: result[0].wallet_address,
    })
  } catch (error) {
    console.error("Error saving wallet address:", error)
    return NextResponse.json({ error: "Failed to save wallet address" }, { status: 500 })
  }
}
