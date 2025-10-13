import { neon } from "@neondatabase/serverless"
import { verifySignature } from "@/lib/utils/verify-signature"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-cybrid-signature") || ""
  const secret = process.env.CYBRID_WEBHOOK_SECRET

  let status = "received"
  let metadata: any = {}
  let event: any = null

  try {
    if (secret) {
      const valid = verifySignature(rawBody, signature, secret)
      if (!valid) {
        status = "invalid_signature"
        metadata = { signature: signature.substring(0, 20) + "...", bodyLength: rawBody.length }

        await sql`
          INSERT INTO audit_logs (actor_type, action, status, metadata, created_at)
          VALUES ('webhook', 'CYBRID_EVENT', ${status}, ${JSON.stringify(metadata)}::jsonb, now())
        `

        console.error("[v0] Invalid Cybrid webhook signature")
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 })
      }
    } else {
      console.warn("[v0] CYBRID_WEBHOOK_SECRET not set - signature verification skipped")
    }

    event = JSON.parse(rawBody)
    console.log("[v0] Cybrid webhook received:", event.event_type)

    const { event_type, object_guid, guid } = event

    let newStatus: string | null = null
    if (event_type.endsWith("completed")) newStatus = "confirmed"
    if (event_type.endsWith("failed")) newStatus = "failed"
    if (event_type.endsWith("cancelled")) newStatus = "cancelled"

    if (newStatus) {
      await sql`
        UPDATE transactions
        SET status = ${newStatus}, updated_at = now()
        WHERE provider = 'cybrid' AND provider_txn_id = ${object_guid};
      `

      status = "processed"
      metadata = {
        event_type,
        object_guid,
        event_guid: guid,
        new_status: newStatus,
      }

      console.log("[v0] Updated transaction status:", { object_guid, newStatus })
    } else {
      status = "ignored"
      metadata = { event_type, object_guid, reason: "No status mapping" }
    }

    await sql`
      INSERT INTO audit_logs (actor_type, action, status, metadata, created_at)
      VALUES ('webhook', 'CYBRID_EVENT', ${status}, ${JSON.stringify(metadata)}::jsonb, now())
    `

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err: any) {
    console.error("[v0] Cybrid webhook error:", err)

    status = "error"
    metadata = {
      error: err.message,
      event_type: event?.event_type,
      stack: err.stack?.substring(0, 500),
    }

    await sql`
      INSERT INTO audit_logs (actor_type, action, status, metadata, created_at)
      VALUES ('webhook', 'CYBRID_EVENT', ${status}, ${JSON.stringify(metadata)}::jsonb, now())
    `

    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 })
  }
}
