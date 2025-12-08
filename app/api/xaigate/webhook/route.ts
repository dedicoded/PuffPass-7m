import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getXaigateClient } from "@/lib/xaigate-client"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-xaigate-signature") || ""
    const payload = await request.text()

    const xaigateClient = getXaigateClient()

    // Verify webhook signature
    if (!xaigateClient.verifyWebhookSignature(payload, signature)) {
      console.error("[v0] Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(payload)
    console.log("[v0] XAIGATE webhook received:", data)

    // XaiGate webhook payload structure
    const { userId, txid, coin, amount, confirmations, status, type, date, networkId } = data

    // Only process deposit transactions
    if (type !== "deposit") {
      console.log("[v0] Ignoring non-deposit transaction:", type)
      return NextResponse.json({ success: true, message: "Non-deposit transaction ignored" })
    }

    const sql = await getSql()

    // Find the payment record by userId and amount
    const payments = await sql`
      SELECT * FROM crypto_payments 
      WHERE user_id = ${userId}
      AND amount = ${Number.parseFloat(amount)}
      AND status IN ('pending', 'confirming')
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (payments.length === 0) {
      console.warn("[v0] No matching payment found for webhook:", { userId, amount })
      return NextResponse.json({ success: true, message: "No matching payment found" })
    }

    const payment = payments[0]

    // Determine payment status based on confirmations
    let paymentStatus = "pending"
    if (confirmations >= 12) {
      paymentStatus = "completed"
    } else if (confirmations > 0) {
      paymentStatus = "confirming"
    }

    // Update payment status
    await sql`
      UPDATE crypto_payments 
      SET 
        status = ${paymentStatus},
        tx_hash = ${txid},
        confirmations = ${confirmations},
        completed_at = ${paymentStatus === "completed" ? new Date(date) : null},
        updated_at = NOW()
      WHERE id = ${payment.id}
    `

    console.log("[v0] Payment updated:", {
      paymentId: payment.payment_id,
      status: paymentStatus,
      confirmations,
    })

    // If payment completed, credit user's PUFF balance
    if (paymentStatus === "completed") {
      // 1 USD = 100 PUFF
      const puffAmount = Number.parseFloat(amount) * 100

      await sql`
        UPDATE users 
        SET puff_balance = puff_balance + ${puffAmount}
        WHERE id = ${userId}
      `

      // Record transaction
      await sql`
        INSERT INTO transactions (
          user_id,
          type,
          amount,
          points_earned,
          status,
          created_at
        ) VALUES (
          ${userId},
          'crypto_deposit',
          ${Number.parseFloat(amount)},
          ${puffAmount},
          'completed',
          NOW()
        )
      `

      console.log("[v0] Payment completed - credited", puffAmount, "PUFF to user", userId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 },
    )
  }
}
