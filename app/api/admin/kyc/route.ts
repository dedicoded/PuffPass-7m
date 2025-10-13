import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const sql = await getSql()

    // Get all KYC verifications for admin review
    const verifications = await sql`
      SELECT 
        kv.id,
        kv.user_id,
        kv.first_name,
        kv.last_name,
        kv.verification_level,
        kv.status,
        kv.risk_level,
        kv.submitted_at,
        kv.reviewed_at,
        up.email
      FROM kyc_verifications kv
      LEFT JOIN user_profiles up ON kv.user_id = up.user_id
      ORDER BY kv.submitted_at DESC
    `

    // Get verification counts by status
    const statusCounts = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM kyc_verifications
      GROUP BY status
    `

    return NextResponse.json({
      verifications,
      statusCounts: statusCounts.reduce(
        (acc, row) => {
          acc[row.status] = Number.parseInt(row.count)
          return acc
        },
        {} as Record<string, number>,
      ),
    })
  } catch (error) {
    console.error("Admin KYC fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch KYC verifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { verificationId, action, reason, reviewedBy } = await request.json()

    if (!verificationId || !action || !reviewedBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    const sql = await getSql()

    // Update verification status
    await sql`
      UPDATE kyc_verifications 
      SET 
        status = ${newStatus},
        reviewed_by = ${reviewedBy},
        reviewed_at = NOW(),
        verification_notes = ${reason || null}
      WHERE id = ${verificationId}
    `

    // Update user profile KYC status
    if (action === "approve") {
      await sql`
        UPDATE user_profiles 
        SET 
          kyc_status = 'verified',
          kyc_verified_at = NOW()
        WHERE user_id = (
          SELECT user_id FROM kyc_verifications WHERE id = ${verificationId}
        )
      `
    }

    // Create audit log entry
    await sql`
      INSERT INTO kyc_audit_log (
        kyc_verification_id,
        action,
        new_status,
        performed_by,
        reason
      ) VALUES (
        ${verificationId},
        ${action},
        ${newStatus},
        ${reviewedBy},
        ${reason || null}
      )
    `

    return NextResponse.json({
      success: true,
      message: `Verification ${action}d successfully`,
    })
  } catch (error) {
    console.error("Admin KYC action error:", error)
    return NextResponse.json({ error: "Failed to process KYC action" }, { status: 500 })
  }
}
