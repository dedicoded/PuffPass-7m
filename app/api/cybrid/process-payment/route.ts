import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"
import { CybridProvider } from "@/lib/payment-providers/cybrid"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Processing Cybrid payment")

    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, fees, puffAmount, symbol } = await request.json()

    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Invalid amount. Minimum $50 required." }, { status: 400 })
    }

    const cybridProvider = new CybridProvider()

    const paymentResult = await cybridProvider.processPayment({
      userId: user.id,
      amount: amount,
      currency: "USD",
      symbol: symbol || "BTC-USD",
      fees: fees,
    })

    if (!paymentResult.success) {
      console.error("[v0] Cybrid payment failed:", paymentResult.error)
      return NextResponse.json(
        {
          error: paymentResult.error || "Payment processing failed",
          details: paymentResult.details,
        },
        { status: 500 },
      )
    }

    // Create transaction record
    const transactionId = paymentResult.transactionId

    await sql`
      INSERT INTO transactions (
        id, user_id, amount, fees, status, payment_method, 
        external_transaction_id, puff_amount, created_at
      ) VALUES (
        ${transactionId},
        ${user.id},
        ${amount},
        ${fees},
        ${paymentResult.status},
        'cybrid',
        ${transactionId},
        ${puffAmount},
        NOW()
      )
    `

    console.log("[v0] Cybrid payment transaction recorded:", transactionId)

    return NextResponse.json({
      success: true,
      transactionId,
      amount,
      puffAmount,
      method: "cybrid",
      status: paymentResult.status,
      mode: paymentResult.mode,
      details: paymentResult.details,
    })
  } catch (error) {
    console.error("[v0] Cybrid payment error:", error)
    return NextResponse.json(
      { error: "Payment processing failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
