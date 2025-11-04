import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

/**
 * Webhook Registration API
 *
 * POST /api/v1/webhooks/register
 *
 * Registers a webhook endpoint to receive payment notifications.
 */

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 })
    }

    const sql = await getSql()
    const apiKeyResult = await sql`
      SELECT * FROM api_keys
      WHERE key = ${apiKey} AND active = true AND expires_at > NOW()
    `

    if (apiKeyResult.length === 0) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 })
    }

    const apiKeyData = apiKeyResult[0]

    // Parse request body
    const body = await request.json()
    const { url, events, secret } = body

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Missing required fields: url, events (array)" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 })
    }

    // Validate events
    const validEvents = ["payment.created", "payment.completed", "payment.failed", "payment.refunded"]
    const invalidEvents = events.filter((e: string) => !validEvents.includes(e))
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(", ")}. Valid events: ${validEvents.join(", ")}` },
        { status: 400 },
      )
    }

    // Generate webhook ID
    const webhookId = `WH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Generate webhook secret if not provided
    const webhookSecret = secret || `whsec_${Math.random().toString(36).substr(2, 32)}`

    // Register webhook
    await sql`
      INSERT INTO webhooks (
        id, api_key_id, url, events, secret, active, created_at
      ) VALUES (
        ${webhookId}, ${apiKeyData.id}, ${url}, ${JSON.stringify(events)}, ${webhookSecret}, true, NOW()
      )
    `

    return NextResponse.json({
      success: true,
      webhookId,
      url,
      events,
      secret: webhookSecret,
      active: true,
      createdAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Webhook registration error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 })
    }

    const sql = await getSql()
    const apiKeyResult = await sql`
      SELECT * FROM api_keys
      WHERE key = ${apiKey} AND active = true AND expires_at > NOW()
    `

    if (apiKeyResult.length === 0) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 })
    }

    const apiKeyData = apiKeyResult[0]

    // Get all webhooks for this API key
    const webhooks = await sql`
      SELECT id, url, events, active, created_at, last_triggered_at
      FROM webhooks
      WHERE api_key_id = ${apiKeyData.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      webhooks: webhooks.map((wh) => ({
        id: wh.id,
        url: wh.url,
        events: wh.events,
        active: wh.active,
        createdAt: wh.created_at,
        lastTriggeredAt: wh.last_triggered_at,
      })),
    })
  } catch (error: any) {
    console.error("[v0] Webhook list error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
