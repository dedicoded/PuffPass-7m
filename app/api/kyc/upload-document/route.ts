import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

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

    // In a real implementation, you would upload to a secure storage service
    // For now, we'll simulate the upload and store a placeholder URL
    const fileUrl = `/uploads/kyc/${verificationId}/${documentType}_${Date.now()}.${file.name.split(".").pop()}`

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
        ${fileUrl},
        ${file.size},
        ${file.type},
        'uploaded'
      ) RETURNING id
    `

    // Update verification record with document URLs
    if (documentType === "id_front") {
      await sql`
        UPDATE kyc_verifications 
        SET document_front_url = ${fileUrl}
        WHERE id = ${verificationId}
      `
    } else if (documentType === "id_back") {
      await sql`
        UPDATE kyc_verifications 
        SET document_back_url = ${fileUrl}
        WHERE id = ${verificationId}
      `
    } else if (documentType === "selfie") {
      await sql`
        UPDATE kyc_verifications 
        SET selfie_url = ${fileUrl}
        WHERE id = ${verificationId}
      `
    }

    return NextResponse.json({
      success: true,
      documentId: document[0].id,
      fileUrl,
      message: "Document uploaded successfully",
    })
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
