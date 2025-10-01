/**
 * Cybrid Webhook Test Script
 * Simulates Cybrid webhook callbacks locally
 *
 * Usage: ts-node scripts/test-cybrid-webhook.ts
 */

async function testWebhook(eventType: string, objectGuid: string) {
  const fakeEvent = {
    guid: `evt_${Date.now()}`,
    event_type: eventType,
    object_guid: objectGuid,
    created_at: new Date().toISOString(),
  }

  console.log(`[v0] Sending ${eventType} webhook...`)

  const res = await fetch("http://localhost:3000/api/webhooks/cybrid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fakeEvent),
  })

  const data = await res.json()
  console.log(`[v0] Response (${res.status}):`, data)
  return res.ok
}

async function run() {
  console.log("[v0] Testing Cybrid webhook handler...\n")

  // Test 1: Completed trade
  console.log("Test 1: Trade completed")
  await testWebhook("trade.completed", "test_trade_123")

  // Test 2: Failed trade
  console.log("\nTest 2: Trade failed")
  await testWebhook("trade.failed", "test_trade_456")

  // Test 3: Unknown event (should be ignored)
  console.log("\nTest 3: Unknown event")
  await testWebhook("trade.pending", "test_trade_789")

  console.log("\n[v0] ✅ Webhook tests completed")
  console.log("[v0] Check your database transactions table and audit_logs for updates")
}

run().catch(console.error)
