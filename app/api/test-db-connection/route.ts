import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET() {
  try {
    const sql = await getSql()

    // Test basic connection
    const connectionTest = await sql`SELECT NOW() as current_time`

    // Get table counts
    const [userCount, productCount, orderCount, merchantCount] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM products`,
      sql`SELECT COUNT(*) as count FROM orders`,
      sql`SELECT COUNT(*) as count FROM merchant_profiles`,
    ])

    return NextResponse.json({
      success: true,
      timestamp: connectionTest[0].current_time,
      stats: {
        users: Number.parseInt(userCount[0].count),
        products: Number.parseInt(productCount[0].count),
        orders: Number.parseInt(orderCount[0].count),
        merchants: Number.parseInt(merchantCount[0].count),
      },
    })
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
