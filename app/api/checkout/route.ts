import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getProductById, getUserPuffPoints } from "@/lib/db"

// Simple cart storage reference
const cartStorage = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { usePoints, pointsToUse } = await request.json()

    // Get cart items
    const cart = cartStorage.get(session.id) || []
    if (cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Calculate totals
    let subtotal = 0
    const items = []

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

      items.push({
        product,
        quantity: cartItem.quantity,
        itemTotal: Math.round(itemTotal * 100) / 100,
      })
    }

    const taxRate = 0.09 // 9% tax rate
    const tax = Math.round(subtotal * taxRate * 100) / 100
    let total = Math.round((subtotal + tax) * 100) / 100

    // Handle Puff Points discount
    let pointsDiscount = 0
    let availablePoints = 0

    if (usePoints && pointsToUse > 0) {
      availablePoints = await getUserPuffPoints(session.id)

      if (pointsToUse > availablePoints) {
        return NextResponse.json({ error: "Insufficient Puff Points" }, { status: 400 })
      }

      // 1 point = $0.01 discount
      pointsDiscount = Math.min(pointsToUse * 0.01, total)
      total = Math.max(0, total - pointsDiscount)
    }

    return NextResponse.json({
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      pointsDiscount: Math.round(pointsDiscount * 100) / 100,
      total: Math.round(total * 100) / 100,
      availablePoints,
      estimatedPoints: Math.floor(total), // Points earned from this order
    })
  } catch (error) {
    console.error("[v0] Checkout calculation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
