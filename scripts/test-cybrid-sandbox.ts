/**
 * Cybrid Sandbox Test Script
 * Tests end-to-end flow: OAuth → Customer → Quote → Trade
 *
 * Usage: ts-node scripts/test-cybrid-sandbox.ts
 */

const BASE_URL = process.env.CYBRID_API_URL || "https://bank.sandbox.cybrid.app"
const CLIENT_ID = process.env.CYBRID_CLIENT_ID!
const CLIENT_SECRET = process.env.CYBRID_CLIENT_SECRET!
const BANK_GUID = process.env.CYBRID_BANK_GUID!

async function getToken() {
  console.log("[v0] Getting OAuth token...")
  const res = await fetch(`${BASE_URL}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "banks:read banks:write customers:read customers:write quotes:execute trades:execute",
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`OAuth failed: ${error}`)
  }

  const data = await res.json()
  console.log("[v0] ✓ OAuth token obtained")
  return data.access_token
}

async function run() {
  try {
    const token = await getToken()

    // 1. Create a customer
    console.log("\n[v0] Creating customer...")
    const customerRes = await fetch(`${BASE_URL}/api/customers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "individual",
        name: { first: "Test", last: "User" },
        address: {
          street: "123 Test St",
          city: "Washington",
          subdivision: "DC",
          postal_code: "20001",
          country_code: "US",
        },
        date_of_birth: "1990-01-01",
        email_address: "test@puffpass.com",
      }),
    })

    if (!customerRes.ok) {
      const error = await customerRes.text()
      throw new Error(`Customer creation failed: ${error}`)
    }

    const customer = await customerRes.json()
    console.log("[v0] ✓ Customer created:", customer.guid)

    // 2. Generate a quote (buy $10 USD worth of USDC)
    console.log("\n[v0] Generating quote...")
    const quoteRes = await fetch(`${BASE_URL}/api/quotes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_type: "trading",
        customer_guid: customer.guid,
        symbol: "USDC-USD",
        side: "buy",
        deliver_amount: 1000000, // $10.00 in micro-units
      }),
    })

    if (!quoteRes.ok) {
      const error = await quoteRes.text()
      throw new Error(`Quote generation failed: ${error}`)
    }

    const quote = await quoteRes.json()
    console.log("[v0] ✓ Quote generated:", {
      guid: quote.guid,
      deliver_amount: quote.deliver_amount,
      receive_amount: quote.receive_amount,
      fee: quote.fee,
    })

    // 3. Execute the trade
    console.log("\n[v0] Executing trade...")
    const tradeRes = await fetch(`${BASE_URL}/api/trades`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quote_guid: quote.guid,
      }),
    })

    if (!tradeRes.ok) {
      const error = await tradeRes.text()
      throw new Error(`Trade execution failed: ${error}`)
    }

    const trade = await tradeRes.json()
    console.log("[v0] ✓ Trade executed:", {
      guid: trade.guid,
      state: trade.state,
      side: trade.side,
    })

    console.log("\n[v0] ✅ Sandbox test completed successfully!")
    console.log("[v0] Trade GUID:", trade.guid)
    console.log("[v0] Monitor webhook for status updates")
  } catch (error: any) {
    console.error("\n[v0] ❌ Test failed:", error.message)
    process.exit(1)
  }
}

run()
