import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateOrderStatus } from "@/lib/db"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get order with items
    const result = await sql`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price,
            'product_name', p.name,
            'product_category', p.category
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ${id}
      GROUP BY o.id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = result[0]

    // Check permissions
    if (session.role === "customer" && order.customer_id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (session.role === "merchant" && order.merchant_id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("[v0] Get order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || (session.role !== "merchant" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    const { id } = await params

    const validStatuses = ["pending", "confirmed", "processing", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get order to check permissions
    const orderResult = await sql`
      SELECT * FROM orders WHERE id = ${id}
    `

    if (orderResult.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult[0]

    // Check permissions
    if (session.role === "merchant" && order.merchant_id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await updateOrderStatus(id, status)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
