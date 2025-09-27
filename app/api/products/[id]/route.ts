import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getProductById } from "@/lib/db"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Only allow merchants to see their own products, or admins/customers to see active products
    if (session.role === "merchant" && product.merchant_id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (session.role === "customer" && product.status !== "active") {
      return NextResponse.json({ error: "Product not available" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("[v0] Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.merchant_id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData = await request.json()

    // Build update query dynamically
    const allowedFields = [
      "name",
      "description",
      "category",
      "strain_type",
      "thc_percentage",
      "cbd_percentage",
      "price_per_unit",
      "unit_type",
      "stock_quantity",
      "lab_tested",
      "lab_results",
      "status",
    ]

    const updates = []
    const values = []

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${values.length + 1}`)
        values.push(value)
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    values.push(id) // Add product ID for WHERE clause

    const result = await sql`
      UPDATE products 
      SET ${sql.unsafe(updates.join(", "))}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ success: true, product: result[0] })
  } catch (error) {
    console.error("[v0] Update product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.merchant_id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete by setting status to inactive
    await sql`
      UPDATE products 
      SET status = 'inactive', updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
