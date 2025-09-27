import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, walletAddress, network, isPrimary } = await request.json()

    // Check if wallet already exists
    const existingWallet = await sql`
      SELECT id FROM user_crypto_wallets 
      WHERE user_id = ${userId} AND wallet_address = ${walletAddress}
    `

    if (existingWallet.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Wallet already connected",
      })
    }

    // If this is primary, unset other primary wallets
    if (isPrimary) {
      await sql`
        UPDATE user_crypto_wallets 
        SET is_primary = false 
        WHERE user_id = ${userId}
      `
    }

    // Insert new wallet
    await sql`
      INSERT INTO user_crypto_wallets (
        user_id, 
        wallet_address, 
        currency, 
        network, 
        is_primary
      ) VALUES (
        ${userId},
        ${walletAddress},
        'ETH',
        ${network || "ethereum"},
        ${isPrimary || false}
      )
    `

    // Also update the main users table
    await sql`
      UPDATE users 
      SET wallet_address = ${walletAddress}
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Wallet connected successfully",
    })
  } catch (error) {
    console.error("Error saving wallet address:", error)
    return NextResponse.json({ error: "Failed to save wallet address" }, { status: 500 })
  }
}
