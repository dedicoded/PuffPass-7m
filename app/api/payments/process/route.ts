// Unified Payment Processing API - Provider-agnostic endpoint

import { getSql, getProviderId } from "@/lib/db"
import { paymentRegistry } from "@/lib/payment-providers/registry"

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
      console.error("[v0] Payment provider returned error:", result.error)
      return Response.json({ success: false, error: result.error }, { status: 500 })
    }

    try {
      console.log("[v0] Getting provider ID for:", provider)
      const providerId = await getProviderId(provider)
      console.log("[v0] Provider ID obtained:", providerId)

      const sql = await getSql()
      console.log("[v0] Recording transaction in database")

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

      console.log("[v0] Transaction recorded successfully")
    } catch (dbError: any) {
      console.error("[v0] Database error (non-fatal):", dbError)
      console.error("[v0] Error details:", {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail,
      })
      // Continue even if database recording fails
    }

    console.log("[v0] Payment processed successfully", result.transactionId)

    return Response.json({
      success: true,
      transaction: result,
    })
  } catch (error: any) {
    console.error("[v0] Payment processing error:", error)
    console.error("[v0] Error details:", {
      message: error?.message || "No message",
      stack: error?.stack || "No stack",
      name: error?.name || "No name",
    })
    return Response.json(
      {
        success: false,
        error: error?.message || error?.toString() || "Payment processing failed",
      },
      { status: 500 },
    )
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
