import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getXaigateClient } from "@/lib/xaigate-client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 })
    }

    const sql = await getSql()

    // Verify payment belongs to user
    const payment = await sql`
      SELECT * FROM crypto_payments 
      WHERE payment_id = ${paymentId} AND user_id = ${session.userId}
    `

    if (!payment[0]) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const xaigateClient = getXaigateClient()
    const status = await xaigateClient.getPaymentStatus(paymentId)

    // Update database if status changed
    if (status.status !== payment[0].status) {
      await sql`
        UPDATE crypto_payments 
        SET 
          status = ${status.status},
          tx_hash = ${status.txHash || null},
          confirmations = ${status.confirmations || 0},
          completed_at = ${status.completedAt || null},
          updated_at = NOW()
        WHERE payment_id = ${paymentId}
      `

      console.log("[v0] Payment status updated:", paymentId, status.status)
    }

    return NextResponse.json({
      success: true,
      status: {
        paymentId: status.paymentId,
        status: status.status,
        txHash: status.txHash,
        confirmations: status.confirmations,
        completedAt: status.completedAt,
      },
    })
  } catch (error) {
    console.error("[v0] Payment status check error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check payment status" },
      { status: 500 },
    )
  }
}
