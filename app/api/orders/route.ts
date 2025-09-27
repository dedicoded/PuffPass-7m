import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import {
  createOrder,
  createOrderItem,
  getOrdersByCustomer,
  getOrdersByMerchant,
  updateProductStock,
  addPuffPoints,
} from "@/lib/db"
import { getProductById } from "@/lib/db"

// Simple cart storage reference (same as cart API)
const cartStorage = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get("merchant_id")

    let orders
    if (session.role === "customer") {
      orders = await getOrdersByCustomer(session.id)
    } else if (session.role === "merchant") {
      orders = await getOrdersByMerchant(session.id)
    } else if (session.role === "admin" && merchantId) {
      orders = await getOrdersByMerchant(merchantId)
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("[v0] Get orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { deliveryMethod, deliveryAddress, notes, paymentMethod = "puff_pass" } = await request.json()

    // Get cart items
    const cart = cartStorage.get(session.id) || []
    if (cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Validate cart items and calculate totals
    let subtotal = 0
    const orderItems = []
    const merchantIds = new Set()

    for (const cartItem of cart) {
      const product = await getProductById(cartItem.productId)
      if (!product || product.status !== "active") {
        return NextResponse.json({ error: `Product ${cartItem.productId} is not available` }, { status: 400 })
      }

      if (product.stock_quantity < cartItem.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }

      const itemTotal = product.price_per_unit * cartItem.quantity
      subtotal += itemTotal
      merchantIds.add(product.merchant_id)

      orderItems.push({
        product,
        quantity: cartItem.quantity,
        unit_price: product.price_per_unit,
        total_price: itemTotal,
      })
    }

    // For now, we'll create one order per merchant (in production, handle multi-merchant orders)
    if (merchantIds.size > 1) {
      return NextResponse.json({ error: "Cannot order from multiple merchants in one transaction" }, { status: 400 })
    }

    const merchantId = Array.from(merchantIds)[0] as string
    const taxRate = 0.09 // 9% tax rate
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100

    // Create order
    const order = await createOrder({
      customer_id: session.id,
      merchant_id: merchantId,
      total_amount: totalAmount,
      tax_amount: taxAmount,
      status: "pending",
      payment_method: paymentMethod,
      payment_status: "pending",
      delivery_method: deliveryMethod,
      delivery_address: deliveryAddress,
      notes: notes,
    })

    // Create order items and update stock
    for (const item of orderItems) {
      await createOrderItem({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })

      // Update product stock
      await updateProductStock(item.product.id, item.product.stock_quantity - item.quantity)
    }

    // Add Puff Points (1 point per dollar spent)
    const pointsEarned = Math.floor(totalAmount)
    await addPuffPoints(session.id, pointsEarned, `Points earned from order ${order.id}`, order.id)

    // Clear cart
    cartStorage.delete(session.id)

    return NextResponse.json({
      success: true,
      order,
      pointsEarned,
    })
  } catch (error) {
    console.error("[v0] Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
