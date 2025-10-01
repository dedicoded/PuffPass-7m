import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * Ledger Enforcement Layer
 *
 * Records all financial events in the ledger_events table for:
 * - Double-entry accounting
 * - Audit trails
 * - Reconciliation
 * - Investor reporting
 */
export async function recordLedgerEvent({
  actorId,
  actorType,
  flowType,
  amount,
  currency,
  sourceTxnId,
  metadata,
}: {
  actorId: string | null
  actorType: "user" | "merchant" | "system"
  flowType: "onramp" | "purchase" | "withdrawal" | "reward_redemption" | "yield_distribution" | "merchant_settlement"
  amount: number
  currency: string
  sourceTxnId?: string
  metadata?: Record<string, any>
}) {
  try {
    await sql`
      INSERT INTO ledger_events (
        actor_id,
        actor_type,
        flow_type,
        amount,
        currency,
        source_txn_id,
        metadata,
        created_at
      ) VALUES (
        ${actorId},
        ${actorType},
        ${flowType},
        ${amount},
        ${currency},
        ${sourceTxnId || null},
        ${JSON.stringify(metadata || {})}::jsonb,
        now()
      )
    `

    console.log(`✅ Ledger event recorded: ${flowType} for ${actorType} (${amount} ${currency})`)
    return { success: true }
  } catch (error) {
    console.error(`❌ Failed to record ledger event: ${flowType}`, error)
    throw error
  }
}
