import { neon } from "@neondatabase/serverless"
import { getProviderId } from "@/app/api/utils" // Assuming getProviderId is defined in a utils file

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const { userId, amount, currency = "USD", walletAddress } = await req.json()

    console.log("[v0] Processing Sphere payment:", { userId, amount, currency, walletAddress })

    if (!userId || !amount || amount <= 0) {
      return Response.json({ success: false, error: "Invalid payment parameters" }, { status: 400 })
    }

    const providerId = await getProviderId("sphere")

    const sphereConfigured = process.env.SPHERE_API_KEY && process.env.SPHERE_API_URL

    if (!sphereConfigured) {
      console.warn("[v0] Sphere not fully configured - using test mode")

      // Test mode transaction
      const testTransaction = {
        id: `test_sphere_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "confirmed",
        amount,
        currency,
        mode: "test",
      }

      await sql`
        INSERT INTO puff_transactions (user_id, transaction_type, amount, description, status, provider_id, created_at)
        VALUES (${userId}, 'crypto_deposit', ${amount}, ${"Test Sphere payment: " + testTransaction.id}, ${testTransaction.status}, ${providerId}, NOW())
      `

      return Response.json({ success: true, txn: testTransaction, mode: "test" }, { status: 200 })
    }

    console.log("[v0] Processing real Sphere transaction")

    const sphereResponse = await fetch(`${process.env.SPHERE_API_URL}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SPHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: currency.toLowerCase(),
        wallet_address: walletAddress,
        metadata: {
          user_id: userId,
          platform: "puffpass",
        },
      }),
    })

    if (!sphereResponse.ok) {
      const errorData = await sphereResponse.json()
      throw new Error(errorData.message || "Sphere payment failed")
    }

    const spherePayment = await sphereResponse.json()
    console.log("[v0] Sphere payment created:", spherePayment.id)

    await sql`
      INSERT INTO puff_transactions (user_id, transaction_type, amount, description, status, provider_id, created_at)
      VALUES (${userId}, 'crypto_deposit', ${amount}, ${"Sphere payment: " + spherePayment.id}, ${spherePayment.status}, ${providerId}, NOW())
    `

    return Response.json(
      {
        success: true,
        txn: {
          id: spherePayment.id,
          status: spherePayment.status,
          amount,
          currency,
          mode: "live",
        },
      },
      { status: 200 },
    )
  } catch (err: any) {
    console.error("[v0] Sphere payment error:", err)
    return Response.json({ success: false, error: err.message || "Payment processing failed" }, { status: 500 })
  }
}
