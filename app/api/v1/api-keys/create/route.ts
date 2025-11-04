import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import crypto from "crypto"

/**
 * API Key Management - Create API Key
 *
 * POST /api/v1/api-keys/create
 *
 * Creates a new API key for external integrations.
 * Requires admin authentication.
 */

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = request.cookies.get("session")?.value
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { name, merchantId, expiresInDays = 365, permissions = [] } = body

    if (!name || !merchantId) {
      return NextResponse.json({ error: "Missing required fields: name, merchantId" }, { status: 400 })
    }

    // Generate API key
    const apiKey = `pk_${crypto.randomBytes(32).toString("hex")}`
    const keyId = `KEY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const sql = await getSql()

    // Create API key
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    await sql`
      INSERT INTO api_keys (
        id, key, name, merchant_id, permissions, active, expires_at, created_at
      ) VALUES (
        ${keyId}, ${apiKey}, ${name}, ${merchantId}, ${JSON.stringify(permissions)},
        true, ${expiresAt.toISOString()}, NOW()
      )
    `

    return NextResponse.json({
      success: true,
      apiKey: {
        id: keyId,
        key: apiKey,
        name,
        merchantId,
        permissions,
        active: true,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      },
      warning: "Store this API key securely. It will not be shown again.",
    })
  } catch (error: any) {
    console.error("[v0] API key creation error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
