import { type NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/rate-limiter"
import { validatePaymentSecurity } from "@/lib/payment-security"
import { getSql } from "@/lib/db"

/**
 * External Payment API - Create Payment
 *
 * POST /api/v1/payments/create
 *
 * Creates a new payment transaction via external integration.
 * Requires API key authentication.
 */

async function handler(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 })
    }

    // Validate API key
    const sql = await getSql()
    const apiKeyResult = await sql`
      SELECT * FROM api_keys
      WHERE key = ${apiKey} AND active = true AND expires_at > NOW()
    `

    if (apiKeyResult.length === 0) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 })
    }

    const apiKeyData = apiKeyResult[0]

    // Parse request body
    const body = await request.json()
    const { amount, currency, fromAddress, toAddress, metadata } = body

    if (!amount || !currency || !fromAddress || !toAddress) {
      return NextResponse.json(
        { error: "Missing required fields: amount, currency, fromAddress, toAddress" },
        { status: 400 },
      )
    }

    // Security validation
    const securityCheck = await validatePaymentSecurity({
      amount: Number.parseFloat(amount),
      currency,
      fromAddress,
      toAddress,
      ipAddress: request.ip || request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      timestamp: Date.now(),
    })

    if (!securityCheck.passed) {
      // Log blocked transaction
      await sql`
        INSERT INTO payment_logs (
          api_key_id, status, amount, currency, from_address, to_address,
          risk_score, flags, reason, created_at
        ) VALUES (
          ${apiKeyData.id}, 'blocked', ${amount}, ${currency}, ${fromAddress}, ${toAddress},
          ${securityCheck.riskScore}, ${JSON.stringify(securityCheck.flags)}, ${securityCheck.reason},
          NOW()
        )
      `

      return NextResponse.json(
        {
          error: "Payment blocked by security system",
          reason: securityCheck.reason,
          riskScore: securityCheck.riskScore,
          flags: securityCheck.flags,
        },
        { status: 403 },
      )
    }

    // Create payment transaction
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    await sql`
      INSERT INTO payments (
        id, api_key_id, amount, currency, from_address, to_address,
        status, metadata, risk_score, created_at
      ) VALUES (
        ${paymentId}, ${apiKeyData.id}, ${amount}, ${currency}, ${fromAddress}, ${toAddress},
        'pending', ${JSON.stringify(metadata || {})}, ${securityCheck.riskScore}, NOW()
      )
    `

    // Log successful creation
    await sql`
      INSERT INTO payment_logs (
        api_key_id, payment_id, status, amount, currency, from_address, to_address,
        risk_score, created_at
      ) VALUES (
        ${apiKeyData.id}, ${paymentId}, 'created', ${amount}, ${currency}, ${fromAddress}, ${toAddress},
        ${securityCheck.riskScore}, NOW()
      )
    `

    // Update API key usage
    await sql`
      UPDATE api_keys
      SET last_used_at = NOW(), request_count = request_count + 1
      WHERE id = ${apiKeyData.id}
    `

    return NextResponse.json({
      success: true,
      paymentId,
      status: "pending",
      amount,
      currency,
      fromAddress,
      toAddress,
      riskScore: securityCheck.riskScore,
      createdAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Payment creation error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export const POST = withRateLimit(handler, { max: 100, windowMs: 60 * 1000 })
