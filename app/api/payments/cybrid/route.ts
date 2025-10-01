import { neon } from "@neondatabase/serverless"
import { paymentRegistry } from "@/lib/payment-providers/registry"
import { getProviderId } from "@/lib/provider-lookup"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const { userId, amount, currency = "USD", symbol = "BTC-USD", walletAddress } = await req.json()

    console.log("[v0] Cybrid payment request:", { userId, amount, currency, symbol })

    if (!userId || !amount || amount <= 0) {
      return Response.json({ success: false, error: "Invalid payment parameters" }, { status: 400 })
    }

    // Get Cybrid provider from registry
    const cybridProvider = paymentRegistry.get("cybrid")
    if (!cybridProvider) {
      return Response.json({ success: false, error: "Cybrid provider not available" }, { status: 500 })
    }

    // Process payment through Cybrid
    const result = await cybridProvider.processPayment({
      userId,
      amount,
      currency,
      symbol,
      walletAddress,
    })

    if (!result.success) {
      return Response.json({ success: false, error: result.error }, { status: 500 })
    }

    const providerId = await getProviderId("cybrid")

    // Record transaction in database
    await sql`
      INSERT INTO puff_transactions (
        user_id, 
        transaction_type, 
        amount, 
        description, 
        status, 
        provider_id,
        created_at
      )
      VALUES (
        ${userId}, 
        'crypto_deposit', 
        ${amount}, 
        ${"Cybrid payment: " + result.transactionId}, 
        ${result.status},
        ${providerId},
        NOW()
      )
    `

    console.log("[v0] Cybrid payment successful:", result.transactionId)

    return Response.json({
      success: true,
      txn: result,
    })
  } catch (error: any) {
    console.error("[v0] Cybrid payment error:", error)
    return Response.json({ success: false, error: error.message || "Payment processing failed" }, { status: 500 })
  }
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
