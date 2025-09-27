import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getPendingMerchantApprovals } from "@/lib/db"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingMerchants = await getPendingMerchantApprovals()

    // Get user details for each merchant
    const merchantsWithDetails = []
    for (const merchant of pendingMerchants) {
      const userResult = await sql`
        SELECT name, email, created_at
        FROM neon_auth.users_sync 
        WHERE id = ${merchant.user_id}
      `

      if (userResult.length > 0) {
        merchantsWithDetails.push({
          ...merchant,
          user: userResult[0],
        })
      }
    }

    return NextResponse.json({ merchants: merchantsWithDetails })
  } catch (error) {
    console.error("[v0] Get pending merchants error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
