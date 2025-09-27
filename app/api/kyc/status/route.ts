import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get latest KYC verification for user
    const verification = await sql`
      SELECT 
        id,
        verification_level,
        status,
        identity_verified,
        address_verified,
        age_verified,
        document_verified,
        biometric_verified,
        risk_level,
        verification_notes,
        submitted_at,
        reviewed_at,
        expires_at
      FROM kyc_verifications 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT 1
    `

    if (verification.length === 0) {
      return NextResponse.json({
        status: "not_started",
        message: "No KYC verification found",
      })
    }

    const kycData = verification[0]

    // Get uploaded documents
    const documents = await sql`
      SELECT document_type, upload_status, created_at
      FROM kyc_documents 
      WHERE kyc_verification_id = ${kycData.id}
      ORDER BY created_at DESC
    `

    // Get recent audit log entries
    const auditLog = await sql`
      SELECT action, new_status, reason, created_at
      FROM kyc_audit_log 
      WHERE kyc_verification_id = ${kycData.id}
      ORDER BY created_at DESC
      LIMIT 5
    `

    return NextResponse.json({
      verification: kycData,
      documents,
      auditLog,
      completionPercentage: calculateCompletionPercentage(kycData, documents),
    })
  } catch (error) {
    console.error("KYC status error:", error)
    return NextResponse.json({ error: "Failed to get KYC status" }, { status: 500 })
  }
}

function calculateCompletionPercentage(verification: any, documents: any[]): number {
  let completed = 0
  const total = 5

  // Check personal info completion
  if (verification.first_name && verification.last_name && verification.date_of_birth) {
    completed++
  }

  // Check address completion
  if (verification.street_address && verification.city && verification.state) {
    completed++
  }

  // Check document uploads
  const hasIdFront = documents.some((d) => d.document_type === "id_front")
  const hasIdBack = documents.some((d) => d.document_type === "id_back")
  const hasSelfie = documents.some((d) => d.document_type === "selfie")

  if (hasIdFront) completed++
  if (hasIdBack) completed++
  if (hasSelfie) completed++

  return Math.round((completed / total) * 100)
}
