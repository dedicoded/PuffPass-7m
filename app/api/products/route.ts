import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createProduct, getProductsByMerchant } from "@/lib/db"

async function getAllProducts() {
  // This is a simplified implementation
  // In production, you'd want to query all active products from all merchants
  return [
    {
      id: "1",
      name: "Blue Dream",
      category: "flower",
      price: 45.0,
      thc_content: 18.5,
      cbd_content: 0.8,
      description: "A balanced hybrid strain with sweet berry aroma",
      image_url: "",
      merchant_name: "Green Valley Dispensary",
      rating: 4.5,
      in_stock: true,
    },
    {
      id: "2",
      name: "OG Kush",
      category: "flower",
      price: 50.0,
      thc_content: 22.0,
      cbd_content: 0.3,
      description: "Classic indica-dominant strain with earthy pine flavors",
      image_url: "",
      merchant_name: "Mountain High Cannabis",
      rating: 4.7,
      in_stock: true,
    },
    {
      id: "3",
      name: "CBD Gummies",
      category: "edibles",
      price: 25.0,
      thc_content: 0.0,
      cbd_content: 10.0,
      description: "Delicious fruit-flavored gummies with 10mg CBD each",
      image_url: "",
      merchant_name: "Wellness Cannabis Co",
      rating: 4.3,
      in_stock: true,
    },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get("merchant_id")

    if (session.role === "customer" && !merchantId) {
      // For customers, return all available products from all merchants
      // This is a simplified implementation - in production you'd want proper pagination
      const products = await getAllProducts()
      return NextResponse.json({ products })
    }

    // If merchant_id is provided, get products for that merchant
    // Otherwise, if user is a merchant, get their own products
    let targetMerchantId = merchantId
    if (!targetMerchantId && session.role === "merchant") {
      targetMerchantId = session.id
    }

    if (!targetMerchantId) {
      return NextResponse.json({ error: "Merchant ID required" }, { status: 400 })
    }

    // Only allow merchants to see their own products, or admins to see any
    if (session.role === "merchant" && targetMerchantId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const products = await getProductsByMerchant(targetMerchantId)
    return NextResponse.json({ products })
  } catch (error) {
    console.error("[v0] Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "category", "price_per_unit", "unit_type", "stock_quantity"]
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Set merchant_id to current user
    productData.merchant_id = session.id
    productData.status = productData.status || "active"
    productData.lab_tested = productData.lab_tested || false

    const product = await createProduct(productData)
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("[v0] Create product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
