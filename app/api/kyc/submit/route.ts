import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

// Force cache break - Updated for deployment fix
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      firstName,
      lastName,
      dateOfBirth,
      ssnLastFour,
      phone,
      email,
      streetAddress,
      city,
      state,
      zipCode,
      documentType,
      documentNumber,
      documentExpiry,
      documentIssuingState,
      verificationLevel = "basic",
    } = await request.json()

    // Validate required fields
    if (!userId || !firstName || !lastName || !dateOfBirth || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = await getSql()

    // Check if user already has a pending or approved verification
    const existingVerification = await sql`
      SELECT id, status FROM kyc_verifications 
      WHERE user_id = ${userId} 
      AND status IN ('pending', 'in_review', 'approved')
      ORDER BY created_at DESC 
      LIMIT 1
    `

    if (existingVerification.length > 0) {
      const status = existingVerification[0].status
      if (status === "approved") {
        return NextResponse.json({ error: "User is already verified" }, { status: 400 })
      } else {
        return NextResponse.json({ error: "Verification already in progress" }, { status: 400 })
      }
    }

    // Calculate age from date of birth
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const isOver21 = age > 21 || (age === 21 && monthDiff >= 0)

    // Create KYC verification record
    const verification = await sql`
      INSERT INTO kyc_verifications (
        user_id,
        verification_level,
        first_name,
        last_name,
        date_of_birth,
        ssn_last_four,
        phone,
        email,
        street_address,
        city,
        state,
        zip_code,
        document_type,
        document_number,
        document_expiry,
        document_issuing_state,
        age_verified,
        status,
        submitted_at
      ) VALUES (
        ${userId},
        ${verificationLevel},
        ${firstName},
        ${lastName},
        ${dateOfBirth},
        ${ssnLastFour || null},
        ${phone},
        ${email},
        ${streetAddress || null},
        ${city || null},
        ${state || null},
        ${zipCode || null},
        ${documentType || null},
        ${documentNumber || null},
        ${documentExpiry || null},
        ${documentIssuingState || null},
        ${isOver21},
        'pending',
        NOW()
      ) RETURNING id
    `

    // Update user profile KYC status
    await sql`
      UPDATE user_profiles 
      SET kyc_status = 'pending', kyc_level = ${verificationLevel}
      WHERE user_id = ${userId}
    `

    // Create audit log entry with proper IP detection
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown"

    await sql`
      INSERT INTO kyc_audit_log (
        kyc_verification_id,
        action,
        new_status,
        ip_address,
        user_agent
      ) VALUES (
        ${verification[0].id},
        'submitted',
        'pending',
        ${clientIP},
        ${request.headers.get("user-agent") || null}
      )
    `

    return NextResponse.json({
      success: true,
      verificationId: verification[0].id,
      message: "KYC verification submitted successfully",
    })
  } catch (error) {
    console.error("KYC submission error:", error)
    return NextResponse.json({ error: "Failed to submit KYC verification" }, { status: 500 })
  }
}
