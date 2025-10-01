// Unified Payment Processing API - Provider-agnostic endpoint

import { neon } from "@neondatabase/serverless"
import { paymentRegistry } from "@/lib/payment-providers/registry"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const { provider = "cybrid", userId, amount, currency = "USD", symbol, walletAddress, metadata } = await req.json()

    console.log("[v0] Processing payment via", provider, { userId, amount, currency, symbol })

    // Validate input
    if (!userId || !amount || amount <= 0) {
      return Response.json({ success: false, error: "Invalid payment parameters" }, { status: 400 })
    }

    // Get payment provider
    const paymentProvider = paymentRegistry.get(provider)
    if (!paymentProvider) {
      return Response.json({ success: false, error: `Unknown payment provider: ${provider}` }, { status: 400 })
    }

    // Process payment
    const result = await paymentProvider.processPayment({
      userId,
      amount,
      currency,
      symbol,
      walletAddress,
      metadata,
    })

    if (!result.success) {
      return Response.json({ success: false, error: result.error }, { status: 500 })
    }

    const providerId = await getProviderId(provider)

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
        ${`${provider} payment: ${result.transactionId}`}, 
        ${result.status},
        ${providerId},
        NOW()
      )
    `

    console.log("[v0] Payment processed successfully", result.transactionId)

    return Response.json({
      success: true,
      transaction: result,
    })
  } catch (error: any) {
    console.error("[v0] Payment processing error:", error)
    return Response.json({ success: false, error: error.message || "Payment processing failed" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

async function getProviderId(provider: string): Promise<number> {
  const result = await sql`SELECT id FROM payment_providers WHERE name = ${provider}`
  if (result.length > 0) {
    return result[0].id
  }
  throw new Error("Provider not found")
}
