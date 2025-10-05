import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Processing POS payment")

    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items, customer_email, total_amount } = await request.json()

    if (!items || !total_amount || total_amount <= 0) {
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 })
    }

    const sql = getSql()

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (merchant_id, customer_email, total_amount, status, created_at)
      VALUES (${session.id}, ${customer_email || "walk-in"}, ${total_amount}, 'completed', NOW())
      RETURNING id
    `

    const orderId = orderResult[0].id

    // Add order items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${orderId}, ${item.product_id}, ${item.quantity}, ${item.price})
      `

      // Update product stock
      await sql`
        UPDATE products 
        SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE id = ${item.product_id}
      `
    }

    // Update merchant balance (add to available balance)
    const merchantFee = total_amount * 0.025 // 2.5% platform fee
    const merchantEarnings = total_amount - merchantFee

    await sql`
      INSERT INTO merchant_balances (merchant_id, available_balance, total_earned)
      VALUES (${session.id}, ${merchantEarnings}, ${merchantEarnings})
      ON CONFLICT (merchant_id) 
      DO UPDATE SET 
        available_balance = merchant_balances.available_balance + ${merchantEarnings},
        total_earned = merchant_balances.total_earned + ${merchantEarnings}
    `

    console.log("[v0] POS payment processed successfully")
    return NextResponse.json({
      success: true,
      order_id: orderId,
      merchant_earnings: merchantEarnings,
    })
  } catch (error) {
    console.error("[v0] POS payment error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
