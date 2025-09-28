import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Processing enhanced withdrawal request with Puff Vault integration")

    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, destination = "ACH" } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    let availableBalance = 0
    try {
      const balanceResult = await sql`
        SELECT available_balance FROM merchant_balances 
        WHERE merchant_id = ${session.id}
      `
      availableBalance = balanceResult[0]?.available_balance || 0
    } catch (balanceError) {
      console.error("[v0] Error checking balance:", balanceError)
      return NextResponse.json({ error: "Unable to verify balance" }, { status: 500 })
    }

    if (amount > availableBalance) {
      return NextResponse.json(
        {
          error: "Insufficient funds",
          available: availableBalance,
          requested: amount,
        },
        { status: 400 },
      )
    }

    const feeRate = destination === "ACH" ? 0.07 : 0.05 // 7% for instant ACH, 5% for delayed
    const feeAmount = amount * feeRate
    const netAmount = amount - feeAmount

    console.log(`[v0] Withdrawal calculation: ${amount} - ${feeAmount} (${feeRate * 100}%) = ${netAmount}`)

    try {
      await sql`BEGIN`

      // Create enhanced withdrawal request with fee breakdown
      const withdrawalResult = await sql`
        INSERT INTO withdrawal_requests (
          merchant_id, amount, fee_amount, net_amount, fee_rate, 
          destination, status, requested_at
        )
        VALUES (
          ${session.id}, ${amount}, ${feeAmount}, ${netAmount}, ${feeRate},
          ${destination}, 'pending', NOW()
        )
        RETURNING id, amount, fee_amount, net_amount, status, requested_at
      `

      const withdrawalId = withdrawalResult[0].id

      await sql`
        UPDATE merchant_balances 
        SET available_balance = available_balance - ${amount},
            pending_balance = pending_balance + ${amount}
        WHERE merchant_id = ${session.id}
      `

      await sql`
        INSERT INTO puff_vault (source, amount, merchant_id, transaction_id, description)
        VALUES (
          'withdrawal_fee', 
          ${feeAmount}, 
          ${session.id}, 
          ${withdrawalId},
          'Withdrawal fee from merchant payout - powers fee-free consumer payments'
        )
      `

      await sql`
        INSERT INTO merchant_fees (
          merchant_id, transaction_id, fee_type, fee_amount, 
          fee_rate, base_amount, description
        )
        VALUES (
          ${session.id}, ${withdrawalId}, 'withdrawal', ${feeAmount},
          ${feeRate}, ${amount}, 'Withdrawal processing fee'
        )
      `

      await sql`COMMIT`

      console.log("[v0] Enhanced withdrawal request created successfully with Puff Vault integration")

      return NextResponse.json({
        success: true,
        withdrawal: withdrawalResult[0],
        fee_breakdown: {
          gross_amount: amount,
          fee_amount: feeAmount,
          fee_rate: feeRate,
          net_amount: netAmount,
          destination: destination,
        },
        message: `Withdrawal request submitted. You'll receive $${netAmount.toFixed(2)} after $${feeAmount.toFixed(2)} processing fee.`,
      })
    } catch (dbError) {
      await sql`ROLLBACK`
      console.error("[v0] Database error creating enhanced withdrawal:", dbError)
      return NextResponse.json(
        {
          error: "Failed to create withdrawal request",
          details: "Database transaction failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Enhanced withdrawal request error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT 
        id, amount, fee_amount, net_amount, fee_rate, destination,
        status, requested_at, processed_at, notes
      FROM withdrawal_requests 
      WHERE merchant_id = ${session.id}
      ORDER BY requested_at DESC
    `

    return NextResponse.json({
      requests: result || [],
      fee_info: {
        standard_rate: 0.07,
        delayed_rate: 0.05,
        description: "Fees power fee-free payments for your customers",
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching withdrawal history:", error)
    return NextResponse.json({ error: "Failed to fetch withdrawal history" }, { status: 500 })
  }
}
