import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const verificationId = formData.get("verificationId") as string
    const documentType = formData.get("documentType") as string

    if (!file || !verificationId || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and PDF files are allowed" },
        { status: 400 },
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large. Maximum size is 10MB" }, { status: 400 })
    }

    const sql = await getSql()

    const verification = await sql`
      SELECT id, user_id FROM kyc_verifications 
      WHERE id = ${verificationId}
    `

    if (verification.length === 0) {
      return NextResponse.json({ error: "Invalid verification ID" }, { status: 404 })
    }

    const userId = verification[0].user_id

    const filename = `kyc/${verificationId}/${documentType}_${Date.now()}.${file.name.split(".").pop()}`
    const blob = await put(filename, file, {
      access: "public",
    })

    // Store document record
    const document = await sql`
      INSERT INTO kyc_documents (
        kyc_verification_id,
        document_type,
        file_name,
        file_url,
        file_size,
        mime_type,
        upload_status
      ) VALUES (
        ${verificationId},
        ${documentType},
        ${file.name},
        ${blob.url},
        ${file.size},
        ${file.type},
        'uploaded'
      ) RETURNING id
    `

    // Update verification record with document URLs
    if (documentType === "id_front") {
      await sql`
        UPDATE kyc_verifications 
        SET document_front_url = ${blob.url}
        WHERE id = ${verificationId}
      `
    } else if (documentType === "id_back") {
      await sql`
        UPDATE kyc_verifications 
        SET document_back_url = ${blob.url}
        WHERE id = ${verificationId}
      `
    } else if (documentType === "selfie") {
      await sql`
        UPDATE kyc_verifications 
        SET selfie_url = ${blob.url}
        WHERE id = ${verificationId}
      `
    }

    await sql`
      INSERT INTO audit_logs (
        actor_id,
        actor_type,
        action,
        resource_type,
        resource_id,
        new_values,
        metadata
      ) VALUES (
        ${userId},
        'user',
        'KYC_DOCUMENT_UPLOAD',
        'kyc_document',
        ${document[0].id},
        ${JSON.stringify({
          verificationId,
          documentType,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileUrl: blob.url,
        })}::jsonb,
        ${JSON.stringify({
          uploadStatus: "uploaded",
          timestamp: new Date().toISOString(),
        })}::jsonb
      )
    `

    return NextResponse.json({
      success: true,
      documentId: document[0].id,
      fileUrl: blob.url,
      message: "Document uploaded successfully",
    })
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
