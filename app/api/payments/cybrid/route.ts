console.log("[v0] Cybrid payment route module loading...")

import { getSql, getProviderId } from "@/lib/db"
import { paymentRegistry } from "@/lib/payment-providers/registry"

console.log("[v0] Cybrid payment route imports successful")

export async function POST(req: Request) {
  console.log("[v0] ===== CYBRID PAYMENT API CALLED =====")
  console.log("[v0] Request URL:", req.url)
  console.log("[v0] Request method:", req.method)

  try {
    const body = await req.json()
    console.log("[v0] Request body received:", body)

    const { userId, amount, currency = "USD", symbol = "BTC-USD", walletAddress } = body

    console.log("[v0] Cybrid payment request:", { userId, amount, currency, symbol })

    if (!userId || !amount || amount <= 0) {
      console.log("[v0] Invalid payment parameters")
      return Response.json({ success: false, error: "Invalid payment parameters" }, { status: 400 })
    }

    // Get Cybrid provider from registry
    console.log("[v0] Getting Cybrid provider from registry...")
    const cybridProvider = paymentRegistry.get("cybrid")
    if (!cybridProvider) {
      console.error("[v0] Cybrid provider not available in registry")
      return Response.json({ success: false, error: "Cybrid provider not available" }, { status: 500 })
    }
    console.log("[v0] Cybrid provider obtained successfully")

    // Process payment through Cybrid
    console.log("[v0] Processing payment through Cybrid...")
    const result = await cybridProvider.processPayment({
      userId,
      amount,
      currency,
      symbol,
      walletAddress,
    })

    if (!result.success) {
      console.error("[v0] Cybrid payment failed:", result.error)
      return Response.json({ success: false, error: result.error }, { status: 500 })
    }

    try {
      console.log("[v0] Getting provider ID for cybrid")
      const providerId = await getProviderId("cybrid")
      console.log("[v0] Provider ID obtained:", providerId)

      if (providerId) {
        const sql = getSql()
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
            ${"Cybrid payment: " + result.transactionId}, 
            ${result.status},
            ${providerId},
            NOW()
          )
        `

        console.log("[v0] Transaction recorded in database")
      } else {
        console.warn("[v0] Could not get provider ID, skipping transaction record")
      }
    } catch (dbError: any) {
      console.error("[v0] Database error (non-fatal):", dbError)
      console.error("[v0] Error details:", {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail,
      })
      // Continue even if database recording fails
    }

    console.log("[v0] Cybrid payment successful:", result.transactionId)

    return Response.json({
      success: true,
      txn: result,
      mode: result.mode,
    })
  } catch (error: any) {
    console.error("[v0] ===== CYBRID PAYMENT ERROR =====")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error?.message || "No message")
    console.error("[v0] Error stack:", error?.stack || "No stack")
    console.error("[v0] Full error object:", error)

    return Response.json(
      {
        success: false,
        error: error?.message || error?.toString() || "Payment processing failed",
      },
      { status: 500 },
    )
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
