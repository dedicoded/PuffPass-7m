/**
 * Webhook Dispatcher
 *
 * Sends webhook notifications to registered endpoints when payment events occur.
 */

import crypto from "crypto"

interface WebhookPayload {
  event: string
  paymentId: string
  data: any
  timestamp: string
}

export async function dispatchWebhook(
  webhookUrl: string,
  webhookSecret: string,
  payload: WebhookPayload,
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    // Generate signature
    const signature = generateWebhookSignature(payload, webhookSecret)

    // Send webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Timestamp": payload.timestamp,
        "User-Agent": "PuffPass-Webhooks/1.0",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        error: `Webhook returned ${response.status}`,
      }
    }

    return { success: true, statusCode: response.status }
  } catch (error: any) {
    console.error("[v0] Webhook dispatch error:", error)
    return { success: false, error: error.message }
  }
}

export function generateWebhookSignature(payload: WebhookPayload, secret: string): string {
  const payloadString = JSON.stringify(payload)
  return crypto.createHmac("sha256", secret).update(payloadString).digest("hex")
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

/**
 * Trigger webhooks for a payment event
 */
export async function triggerPaymentWebhooks(event: string, paymentId: string, paymentData: any): Promise<void> {
  try {
    const { getSql } = await import("@/lib/db")
    const sql = await getSql()

    // Find all webhooks subscribed to this event
    const webhooks = await sql`
      SELECT w.*, ak.merchant_id
      FROM webhooks w
      JOIN api_keys ak ON w.api_key_id = ak.id
      WHERE w.active = true
      AND w.events @> ${JSON.stringify([event])}::jsonb
    `

    if (webhooks.length === 0) {
      console.log(`[v0] No webhooks registered for event: ${event}`)
      return
    }

    console.log(`[v0] Triggering ${webhooks.length} webhooks for event: ${event}`)

    // Dispatch webhooks in parallel
    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        const payload: WebhookPayload = {
          event,
          paymentId,
          data: paymentData,
          timestamp: new Date().toISOString(),
        }

        const result = await dispatchWebhook(webhook.url, webhook.secret, payload)

        // Log webhook delivery
        await sql`
          INSERT INTO webhook_logs (
            webhook_id, event, payload, status, status_code, error, created_at
          ) VALUES (
            ${webhook.id}, ${event}, ${JSON.stringify(payload)}, 
            ${result.success ? "success" : "failed"}, ${result.statusCode || null},
            ${result.error || null}, NOW()
          )
        `

        // Update last triggered timestamp
        if (result.success) {
          await sql`
            UPDATE webhooks
            SET last_triggered_at = NOW()
            WHERE id = ${webhook.id}
          `
        }

        return result
      }),
    )

    const successful = results.filter((r) => r.status === "fulfilled").length
    console.log(`[v0] Webhook dispatch complete: ${successful}/${webhooks.length} successful`)
  } catch (error) {
    console.error("[v0] Webhook trigger error:", error)
  }
}
