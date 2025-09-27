import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reason, notes } = await request.json()
    const { id } = await params

    if (!reason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    // Check if merchant profile exists
    const merchantResult = await sql`
      SELECT * FROM merchant_profiles WHERE id = ${id}
    `

    if (merchantResult.length === 0) {
      return NextResponse.json({ error: "Merchant profile not found" }, { status: 404 })
    }

    const merchant = merchantResult[0]

    if (merchant.approval_status !== "pending") {
      return NextResponse.json({ error: "Merchant is not pending approval" }, { status: 400 })
    }

    // Reject merchant
    await sql`
      UPDATE merchant_profiles 
      SET approval_status = 'rejected', updated_at = NOW()
      WHERE id = ${id}
    `

    // Create approval workflow record
    await sql`
      INSERT INTO approval_workflows (workflow_type, entity_id, entity_type, status, requested_by, approved_by, rejection_reason, notes)
      VALUES ('merchant_approval', ${id}, 'merchant_profile', 'rejected', ${merchant.user_id}, ${session.id}, ${reason}, ${notes})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Reject merchant error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
