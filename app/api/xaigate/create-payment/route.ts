import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getXaigateClient } from "@/lib/xaigate-client"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] XAIGATE create-payment route called")

    const session = await getSession()
    if (!session) {
      console.log("[v0] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Session found, userId:", session.userId)

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { amount, orderId, description, network, metadata } = body
    console.log("[v0] Payment request:", { amount, orderId, network })

    // Validate amount
    if (!amount || amount < 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (amount === 0) {
      console.log("[v0] Creating test payment with $0 amount")
      // Return mock payment for testing
      const mockPayment = {
        paymentId: `TEST-${Date.now()}`,
        address: "0xTEST" + Math.random().toString(16).substring(2, 42),
        amount: 0,
        currency: "USDC",
        network: network || "1",
        qrCode: `test:payment:${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        status: "completed" as const,
        userId: session.userId,
      }

      return NextResponse.json({
        success: true,
        payment: {
          id: mockPayment.paymentId,
          address: mockPayment.address,
          amount: mockPayment.amount,
          currency: mockPayment.currency,
          network: mockPayment.network,
          qrCode: mockPayment.qrCode,
          expiresAt: mockPayment.expiresAt,
          status: mockPayment.status,
        },
      })
    }

    const sql = await getSql()

    // Get user email
    const user = await sql`
      SELECT email FROM users WHERE id = ${session.userId}
    `

    if (!user[0]) {
      console.log("[v0] User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] User found:", user[0].email)

    const xaigateClient = getXaigateClient()
    const payment = await xaigateClient.createPayment({
      amount,
      userId: session.userId,
      orderId: orderId || `ORDER-${Date.now()}`,
      description: description || `Puff Pass Purchase - $${amount}`,
      customerEmail: user[0].email,
      network: network || "1",
      metadata: {
        ...metadata,
      },
    })

    console.log("[v0] XAIGATE payment created successfully:", payment.paymentId)

    try {
      await sql`
        INSERT INTO crypto_payments (
          user_id,
          payment_id,
          order_id,
          amount,
          currency,
          network,
          address,
          status,
          expires_at,
          created_at
        ) VALUES (
          ${session.userId},
          ${payment.paymentId},
          ${orderId || `ORDER-${Date.now()}`},
          ${amount},
          ${payment.currency},
          ${payment.network},
          ${payment.address},
          ${payment.status},
          ${payment.expiresAt},
          NOW()
        )
      `
      console.log("[v0] Payment stored in database")
    } catch (dbError) {
      console.error("[v0] Database error (table may not exist):", dbError)
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.paymentId,
        address: payment.address,
        amount: payment.amount,
        currency: payment.currency,
        network: payment.network,
        qrCode: payment.qrCode,
        expiresAt: payment.expiresAt,
        status: payment.status,
      },
    })
  } catch (error) {
    console.error("[v0] XAIGATE payment creation error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create payment",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
