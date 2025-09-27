import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getProductsByMerchant, updateProductStock } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await getProductsByMerchant(session.id)

    // Calculate inventory metrics
    const totalProducts = products.length
    const lowStockProducts = products.filter((p) => p.stock_quantity <= 5).length
    const outOfStockProducts = products.filter((p) => p.stock_quantity === 0).length
    const totalValue = products.reduce((sum, p) => sum + p.price_per_unit * p.stock_quantity, 0)

    return NextResponse.json({
      products,
      metrics: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue: Math.round(totalValue * 100) / 100,
      },
    })
  } catch (error) {
    console.error("[v0] Get inventory error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, newStock } = await request.json()

    if (!productId || newStock === undefined) {
      return NextResponse.json({ error: "Product ID and new stock required" }, { status: 400 })
    }

    if (newStock < 0) {
      return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 })
    }

    await updateProductStock(productId, newStock)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update inventory error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
