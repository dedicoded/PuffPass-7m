import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category")
    const strainType = searchParams.get("strain_type")
    const minPrice = searchParams.get("min_price")
    const maxPrice = searchParams.get("max_price")
    const merchantId = searchParams.get("merchant_id")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const sql = getSql()

    // Build dynamic WHERE clause
    const conditions = ["status = 'active'"]
    const params = []

    if (query) {
      conditions.push(`(name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`)
      params.push(`%${query}%`)
    }

    if (category) {
      conditions.push(`category = $${params.length + 1}`)
      params.push(category)
    }

    if (strainType) {
      conditions.push(`strain_type = $${params.length + 1}`)
      params.push(strainType)
    }

    if (minPrice) {
      conditions.push(`price_per_unit >= $${params.length + 1}`)
      params.push(Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      conditions.push(`price_per_unit <= $${params.length + 1}`)
      params.push(Number.parseFloat(maxPrice))
    }

    if (merchantId) {
      conditions.push(`merchant_id = $${params.length + 1}`)
      params.push(merchantId)
    }

    // Add limit and offset
    params.push(limit, offset)

    const whereClause = conditions.join(" AND ")

    const products = await sql`
      SELECT p.*, mp.business_name as merchant_name
      FROM products p
      LEFT JOIN merchant_profiles mp ON p.merchant_id = mp.user_id
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${sql.unsafe(whereClause)}
    `

    return NextResponse.json({
      products,
      total: Number.parseInt(countResult[0].total),
      limit,
      offset,
    })
  } catch (error) {
    console.error("[v0] Search products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
