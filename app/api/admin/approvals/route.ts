import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getPendingApprovals } from "@/lib/db"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workflowType = searchParams.get("type")
    const status = searchParams.get("status") || "pending"

    let approvals
    if (workflowType) {
      const result = await sql`
        SELECT * FROM approval_workflows 
        WHERE workflow_type = ${workflowType} AND status = ${status}
        ORDER BY created_at ASC
      `
      approvals = result
    } else {
      approvals = await getPendingApprovals()
    }

    // Get additional details for each approval
    const approvalsWithDetails = []
    for (const approval of approvals) {
      let entityDetails = null

      if (approval.entity_type === "merchant_profile") {
        const merchantResult = await sql`
          SELECT mp.*, u.name as user_name, u.email as user_email
          FROM merchant_profiles mp
          JOIN neon_auth.users_sync u ON mp.user_id = u.id
          WHERE mp.id = ${approval.entity_id}
        `
        entityDetails = merchantResult[0] || null
      }

      approvalsWithDetails.push({
        ...approval,
        entityDetails,
      })
    }

    return NextResponse.json({ approvals: approvalsWithDetails })
  } catch (error) {
    console.error("[v0] Get approvals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
