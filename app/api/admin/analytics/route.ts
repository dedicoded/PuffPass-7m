import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get platform analytics
    const [totalUsers, totalMerchants, totalProducts, totalOrders, pendingApprovals, recentOrders, topMerchants] =
      await Promise.all([
        // Total users by role
        sql`
        SELECT 
          (raw_json->>'role') as role,
          COUNT(*) as count
        FROM neon_auth.users_sync 
        WHERE deleted_at IS NULL
        GROUP BY (raw_json->>'role')
      `,

        // Merchant approval stats
        sql`
        SELECT 
          approval_status,
          COUNT(*) as count
        FROM merchant_profiles
        GROUP BY approval_status
      `,

        // Product stats
        sql`
        SELECT 
          status,
          COUNT(*) as count,
          SUM(stock_quantity * price_per_unit) as total_value
        FROM products
        GROUP BY status
      `,

        // Order stats
        sql`
        SELECT 
          status,
          COUNT(*) as count,
          SUM(total_amount) as total_value
        FROM orders
        GROUP BY status
      `,

        // Pending approvals count
        sql`
        SELECT COUNT(*) as count
        FROM approval_workflows
        WHERE status = 'pending'
      `,

        // Recent orders
        sql`
        SELECT 
          o.*,
          u.name as customer_name,
          mp.business_name as merchant_name
        FROM orders o
        JOIN neon_auth.users_sync u ON o.customer_id = u.id
        LEFT JOIN merchant_profiles mp ON o.merchant_id = mp.user_id
        ORDER BY o.created_at DESC
        LIMIT 10
      `,

        // Top merchants by sales
        sql`
        SELECT 
          mp.business_name,
          mp.user_id,
          COUNT(o.id) as order_count,
          SUM(o.total_amount) as total_sales
        FROM merchant_profiles mp
        LEFT JOIN orders o ON mp.user_id = o.merchant_id
        WHERE mp.approval_status = 'approved'
        GROUP BY mp.id, mp.business_name, mp.user_id
        ORDER BY total_sales DESC NULLS LAST
        LIMIT 10
      `,
      ])

    return NextResponse.json({
      users: totalUsers,
      merchants: totalMerchants,
      products: totalProducts,
      orders: totalOrders,
      pendingApprovals: pendingApprovals[0]?.count || 0,
      recentOrders,
      topMerchants,
    })
  } catch (error) {
    console.error("[v0] Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
