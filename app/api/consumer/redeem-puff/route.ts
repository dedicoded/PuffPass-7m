import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { puffAmount } = await request.json()

    // Validate amount
    if (!puffAmount || puffAmount < 100) {
      return NextResponse.json({ error: "Minimum 100 PUFF required" }, { status: 400 })
    }

    if (puffAmount % 100 !== 0) {
      return NextResponse.json({ error: "Amount must be multiple of 100 PUFF" }, { status: 400 })
    }

    const sql = await getSql()

    // Check user's PUFF balance
    const userBalance = await sql`
      SELECT puff_balance 
      FROM users 
      WHERE id = ${session.userId}
    `

    if (!userBalance[0] || userBalance[0].puff_balance < puffAmount) {
      return NextResponse.json({ error: "Insufficient PUFF balance" }, { status: 400 })
    }

    // Calculate USDC amount (100 PUFF = $1 USDC)
    const usdcAmount = puffAmount / 100

    // In production, this would:
    // 1. Call smart contract redeem() function
    // 2. Wait for blockchain confirmation
    // 3. Update database after confirmation

    // For now, we'll simulate the redemption
    await sql`
      UPDATE users 
      SET puff_balance = puff_balance - ${puffAmount}
      WHERE id = ${session.userId}
    `

    // Record redemption
    await sql`
      INSERT INTO puff_redemptions (user_id, puff_amount, usdc_amount, status, transaction_hash)
      VALUES (${session.userId}, ${puffAmount}, ${usdcAmount}, 'completed', ${"0x" + Math.random().toString(36).substring(7)})
    `

    return NextResponse.json({
      success: true,
      puff_redeemed: puffAmount,
      usdc_received: usdcAmount,
      new_balance: userBalance[0].puff_balance - puffAmount,
      transaction_hash: "0x..." + Math.random().toString(36).substring(7),
    })
  } catch (error) {
    console.error("[v0] PUFF redemption error:", error)
    return NextResponse.json({ error: "Failed to process redemption" }, { status: 500 })
  }
}
