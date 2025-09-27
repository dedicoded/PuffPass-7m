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

    // Get compliance-related data
    const [merchantLicenses, productCompliance, orderTracking] = await Promise.all([
      // Merchant license status
      sql`
        SELECT 
          mp.business_name,
          mp.license_number,
          mp.license_type,
          mp.metrc_facility_id,
          mp.approval_status,
          mp.created_at,
          u.email
        FROM merchant_profiles mp
        JOIN neon_auth.users_sync u ON mp.user_id = u.id
        ORDER BY mp.created_at DESC
      `,

      // Product lab testing compliance
      sql`
        SELECT 
          p.name,
          p.category,
          p.lab_tested,
          p.metrc_id,
          p.status,
          mp.business_name as merchant_name
        FROM products p
        JOIN merchant_profiles mp ON p.merchant_id = mp.user_id
        WHERE p.status = 'active'
        ORDER BY p.lab_tested ASC, p.created_at DESC
      `,

      // Order METRC tracking
      sql`
        SELECT 
          o.id,
          o.metrc_manifest_id,
          o.status,
          o.total_amount,
          o.created_at,
          mp.business_name as merchant_name
        FROM orders o
        JOIN merchant_profiles mp ON o.merchant_id = mp.user_id
        WHERE o.status IN ('processing', 'completed')
        ORDER BY o.created_at DESC
        LIMIT 50
      `,
    ])

    // Calculate compliance metrics
    const totalMerchants = merchantLicenses.length
    const approvedMerchants = merchantLicenses.filter((m) => m.approval_status === "approved").length
    const pendingMerchants = merchantLicenses.filter((m) => m.approval_status === "pending").length

    const totalProducts = productCompliance.length
    const labTestedProducts = productCompliance.filter((p) => p.lab_tested).length
    const unlabTestedProducts = totalProducts - labTestedProducts

    const totalOrders = orderTracking.length
    const trackedOrders = orderTracking.filter((o) => o.metrc_manifest_id).length
    const untrackedOrders = totalOrders - trackedOrders

    return NextResponse.json({
      merchantCompliance: {
        total: totalMerchants,
        approved: approvedMerchants,
        pending: pendingMerchants,
        rejected: totalMerchants - approvedMerchants - pendingMerchants,
        licenses: merchantLicenses,
      },
      productCompliance: {
        total: totalProducts,
        labTested: labTestedProducts,
        unlabTested: unlabTestedProducts,
        products: productCompliance,
      },
      orderTracking: {
        total: totalOrders,
        tracked: trackedOrders,
        untracked: untrackedOrders,
        orders: orderTracking,
      },
    })
  } catch (error) {
    console.error("[v0] Get compliance data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
