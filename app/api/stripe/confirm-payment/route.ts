import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sql } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, userId } = await request.json()

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    const amountUsd = paymentIntent.amount / 100 // Convert from cents
    const puffAmount = amountUsd * 0.95 // 5% conversion fee

    // Record transaction in database
    await sql`
      INSERT INTO transactions (
        user_id, 
        type, 
        amount_usd, 
        amount_puff, 
        stripe_payment_intent_id,
        status,
        created_at
      ) VALUES (
        ${userId},
        'fiat_onramp',
        ${amountUsd},
        ${puffAmount},
        ${paymentIntentId},
        'completed',
        NOW()
      )
    `

    // Update user's PUFF balance
    await sql`
      UPDATE users 
      SET puff_balance = COALESCE(puff_balance, 0) + ${puffAmount}
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      amountUsd,
      puffAmount,
      transactionId: paymentIntentId,
    })
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
}
