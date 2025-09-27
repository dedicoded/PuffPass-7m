import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateOrderStatus, getProductById, updateProductStock } from "@/lib/db"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get order with items
    const orderResult = await sql`
      SELECT o.*, oi.product_id, oi.quantity
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${id}
    `

    if (orderResult.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult[0]

    // Check permissions
    if (session.role === "customer" && order.customer_id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (session.role === "merchant" && order.merchant_id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Can only cancel pending or confirmed orders
    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json({ error: "Cannot cancel order in current status" }, { status: 400 })
    }

    // Restore stock for all items
    for (const item of orderResult) {
      if (item.product_id) {
        const product = await getProductById(item.product_id)
        if (product) {
          await updateProductStock(item.product_id, product.stock_quantity + item.quantity)
        }
      }
    }

    // Update order status
    await updateOrderStatus(id, "cancelled")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Cancel order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
