import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getProductById } from "@/lib/db"

// Simple in-memory cart storage (in production, use Redis or database)
const cartStorage = new Map<string, any[]>()

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cart = cartStorage.get(session.id) || []

    // Calculate cart totals
    let subtotal = 0
    const cartWithDetails = []

    for (const item of cart) {
      const product = await getProductById(item.productId)
      if (product && product.status === "active") {
        const itemTotal = product.price_per_unit * item.quantity
        subtotal += itemTotal

        cartWithDetails.push({
          ...item,
          product,
          itemTotal: Math.round(itemTotal * 100) / 100,
        })
      }
    }

    const taxRate = 0.09 // 9% tax rate
    const tax = Math.round(subtotal * taxRate * 100) / 100
    const total = Math.round((subtotal + tax) * 100) / 100

    return NextResponse.json({
      cart: cartWithDetails,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      total,
    })
  } catch (error) {
    console.error("[v0] Get cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid product ID or quantity" }, { status: 400 })
    }

    // Verify product exists and is available
    const product = await getProductById(productId)
    if (!product || product.status !== "active") {
      return NextResponse.json({ error: "Product not available" }, { status: 404 })
    }

    if (product.stock_quantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    const cart = cartStorage.get(session.id) || []

    // Check if product already in cart
    const existingItemIndex = cart.findIndex((item) => item.productId === productId)

    if (existingItemIndex >= 0) {
      // Update quantity
      cart[existingItemIndex].quantity += quantity

      // Check stock again
      if (cart[existingItemIndex].quantity > product.stock_quantity) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
      }
    } else {
      // Add new item
      cart.push({
        productId,
        quantity,
        addedAt: new Date().toISOString(),
      })
    }

    cartStorage.set(session.id, cart)

    return NextResponse.json({ success: true, cartItemCount: cart.length })
  } catch (error) {
    console.error("[v0] Add to cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    if (!productId || quantity < 0) {
      return NextResponse.json({ error: "Invalid product ID or quantity" }, { status: 400 })
    }

    const cart = cartStorage.get(session.id) || []
    const itemIndex = cart.findIndex((item) => item.productId === productId)

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not in cart" }, { status: 404 })
    }

    if (quantity === 0) {
      // Remove item
      cart.splice(itemIndex, 1)
    } else {
      // Verify stock
      const product = await getProductById(productId)
      if (!product || quantity > product.stock_quantity) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
      }

      cart[itemIndex].quantity = quantity
    }

    cartStorage.set(session.id, cart)

    return NextResponse.json({ success: true, cartItemCount: cart.length })
  } catch (error) {
    console.error("[v0] Update cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    cartStorage.delete(session.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Clear cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
