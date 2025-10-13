import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const merchantId = request.nextUrl.searchParams.get("merchantId")

    if (!merchantId) {
      return NextResponse.json({ error: "Merchant ID required" }, { status: 400 })
    }

    // Get SQL connection
    const sql = await getSql()

    // Get total sales and orders
    const salesData = await sql`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_sales,
        COUNT(*) as total_orders,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders
      WHERE merchant_id = ${merchantId}
        AND status = 'completed'
    `

    // Get top products
    const topProducts = await sql`
      SELECT 
        p.name,
        COUNT(oi.id) as sales,
        SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.merchant_id = ${merchantId}
        AND o.status = 'completed'
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 5
    `

    // Get sales by day for the last 7 days
    const salesByDay = await sql`
      SELECT 
        DATE(created_at) as date,
        SUM(total_amount) as sales
      FROM orders
      WHERE merchant_id = ${merchantId}
        AND status = 'completed'
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    const analytics = {
      totalSales: Number(salesData[0]?.total_sales || 0),
      totalOrders: Number(salesData[0]?.total_orders || 0),
      averageOrderValue: Number(salesData[0]?.average_order_value || 0),
      topProducts: topProducts.map((p) => ({
        name: p.name,
        sales: Number(p.sales),
        revenue: Number(p.revenue),
      })),
      salesByDay: salesByDay.map((d) => ({
        date: d.date,
        sales: Number(d.sales),
      })),
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching merchant analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
