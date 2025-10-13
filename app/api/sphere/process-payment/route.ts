import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Processing Sphere payment")

    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, fees, puffAmount } = await request.json()

    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // TODO: Implement actual Sphere API calls for payment processing
    // For now, simulate successful payment processing

    // Create transaction record
    const transactionId = `sphere_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await sql`
      INSERT INTO transactions (
        id, user_id, amount, fees, status, payment_method, 
        external_transaction_id, puff_amount, created_at
      ) VALUES (
        ${transactionId},
        ${user.id}, -- Use actual authenticated user ID
        ${amount},
        ${fees},
        'completed',
        'sphere',
        ${transactionId},
        ${puffAmount},
        NOW()
      )
    `

    console.log("[v0] Sphere payment transaction recorded:", transactionId)

    return NextResponse.json({
      success: true,
      transactionId,
      amount,
      puffAmount,
      method: "sphere",
    })
  } catch (error) {
    console.error("[v0] Sphere payment error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
