import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

/**
 * External Payment API - Get Payment Status
 *
 * GET /api/v1/payments/status?paymentId=PAY-xxx
 *
 * Retrieves the status of a payment transaction.
 */

export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 })
    }

    const sql = await getSql()
    const apiKeyResult = await sql`
      SELECT * FROM api_keys
      WHERE key = ${apiKey} AND active = true AND expires_at > NOW()
    `

    if (apiKeyResult.length === 0) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 })
    }

    const apiKeyData = apiKeyResult[0]

    // Get payment ID from query
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId parameter" }, { status: 400 })
    }

    // Fetch payment
    const paymentResult = await sql`
      SELECT * FROM payments
      WHERE id = ${paymentId} AND api_key_id = ${apiKeyData.id}
    `

    if (paymentResult.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const payment = paymentResult[0]

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        fromAddress: payment.from_address,
        toAddress: payment.to_address,
        status: payment.status,
        transactionHash: payment.transaction_hash,
        riskScore: payment.risk_score,
        metadata: payment.metadata,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        completedAt: payment.completed_at,
      },
    })
  } catch (error: any) {
    console.error("[v0] Payment status error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
