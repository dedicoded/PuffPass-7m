import { neon } from "@neondatabase/serverless"
import { recordLedgerEvent } from "./record-ledger-event"

const sql = neon(process.env.DATABASE_URL!)

/**
 * Vault Yield Distribution Pipeline
 *
 * Distributes yield earned from treasury float to:
 * - Merchants (based on contribution or redemption volume)
 * - Puff Pass treasury (retained earnings)
 *
 * All distributions are:
 * - Recorded in ledger_events for double-entry accounting
 * - Logged in audit_logs for compliance
 * - Traceable for investor reporting
 */
export async function distributeVaultYield({
  yieldId,
  allocations,
}: {
  yieldId: string
  allocations: {
    merchantId?: string
    treasury?: boolean
    amount: number
    currency?: string
  }[]
}) {
  try {
    for (const allocation of allocations) {
      const flowType = allocation.treasury ? "yield_distribution" : "reward_redemption"
      const actorType = allocation.treasury ? "system" : "merchant"
      const actorId = allocation.treasury ? null : allocation.merchantId

      // Record ledger event for double-entry accounting
      await recordLedgerEvent({
        actorId,
        actorType,
        flowType,
        amount: allocation.amount,
        currency: allocation.currency || "USDC",
        sourceTxnId: yieldId,
        metadata: { yieldId },
      })

      // Add audit log for traceability
      await sql`
        INSERT INTO audit_logs (actor_id, actor_type, action, status, metadata)
        VALUES (
          ${actorId},
          ${actorType},
          'YIELD_ALLOCATED',
          'success',
          ${JSON.stringify({
            yieldId,
            amount: allocation.amount,
            currency: allocation.currency || "USDC",
            treasury: allocation.treasury || false,
            timestamp: new Date().toISOString(),
          })}::jsonb
        )
      `
    }

    console.log(`✅ Distributed yield for ${yieldId} to ${allocations.length} recipients`)
    return { success: true, allocationsProcessed: allocations.length }
  } catch (error) {
    console.error(`❌ Failed to distribute yield for ${yieldId}`, error)

    // Log the failure
    await sql`
      INSERT INTO audit_logs (
        actor_id,
        actor_type,
        action,
        status,
        metadata
      ) VALUES (
        NULL,
        'system',
        'YIELD_DISTRIBUTION_FAILED',
        'failed',
        ${JSON.stringify({
          yieldId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        })}::jsonb
      )
    `

    throw error
  }
}

/**
 * Allocation Strategies (plug in any of these):
 *
 * 1. Pro-rata by float contribution
 *    - Merchants who deposited more get more yield
 *
 * 2. Redemption-weighted
 *    - Merchants whose products were redeemed more get more
 *
 * 3. Fixed split
 *    - e.g. 80% to merchants, 20% retained by Puff Pass
 *
 * 4. Manual override
 *    - Admin sets allocations per cycle
 */
