import { getSql, getProviderId } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId, amount, currency = "USD", walletAddress } = await req.json()

    console.log("[v0] Processing Sphere payment:", { userId, amount, currency, walletAddress })

    if (!userId || !amount || amount <= 0) {
      return Response.json({ success: false, error: "Invalid payment parameters" }, { status: 400 })
    }

    let providerId
    try {
      console.log("[v0] Getting provider ID for sphere")
      providerId = await getProviderId("sphere")
      console.log("[v0] Provider ID obtained:", providerId)
    } catch (providerError: any) {
      console.error("[v0] Failed to get provider ID:", providerError)
      console.error("[v0] Error details:", {
        message: providerError.message,
        code: providerError.code,
        detail: providerError.detail,
      })
      return Response.json(
        {
          success: false,
          error: `Database error: ${providerError.message || "Failed to get provider ID"}`,
        },
        { status: 500 },
      )
    }

    const sphereConfigured = process.env.SPHERE_API_KEY && process.env.SPHERE_API_URL

    if (!sphereConfigured) {
      console.warn("[v0] Sphere not fully configured - using test mode")

      const testTransaction = {
        id: `test_sphere_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "confirmed",
        amount,
        currency,
        mode: "test",
      }

      try {
        const sql = getSql()
        await sql`
          INSERT INTO puff_transactions (user_id, transaction_type, amount, description, status, provider_id, created_at)
          VALUES (${userId}, 'crypto_deposit', ${amount}, ${"Test Sphere payment: " + testTransaction.id}, ${testTransaction.status}, ${providerId}, NOW())
        `
        console.log("[v0] Test transaction recorded")
      } catch (dbError: any) {
        console.error("[v0] Database error (non-fatal):", dbError)
      }

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

    try {
      const sql = getSql()
      await sql`
        INSERT INTO puff_transactions (user_id, transaction_type, amount, description, status, provider_id, created_at)
        VALUES (${userId}, 'crypto_deposit', ${amount}, ${"Sphere payment: " + spherePayment.id}, ${spherePayment.status}, ${providerId}, NOW())
      `
      console.log("[v0] Transaction recorded")
    } catch (dbError: any) {
      console.error("[v0] Database error (non-fatal):", dbError)
    }

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
    console.error("[v0] Error details:", {
      message: err?.message || "No message",
      stack: err?.stack || "No stack",
      name: err?.name || "No name",
    })
    return Response.json(
      {
        success: false,
        error: err?.message || err?.toString() || "Payment processing failed",
      },
      { status: 500 },
    )
  }
}
