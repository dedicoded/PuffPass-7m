import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { customerId, amount, fromCurrency, toCurrency, walletAddress } = await request.json()

    const response = await fetch("https://api.spherepay.co/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SPHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
        amount: amount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        destination: {
          type: "crypto_address",
          address: walletAddress,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create transfer")
    }

    const transfer = await response.json()

    // Store transfer record
    await sql`
      INSERT INTO crypto_transactions (
        user_id,
        sphere_transfer_id,
        amount,
        from_currency,
        to_currency,
        destination_address,
        status,
        created_at
      ) VALUES (
        (SELECT id FROM users WHERE sphere_customer_id = ${customerId}),
        ${transfer.id},
        ${amount},
        ${fromCurrency},
        ${toCurrency},
        ${walletAddress},
        ${transfer.status},
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      status: transfer.status,
    })
  } catch (error) {
    console.error("Error creating transfer:", error)
    return NextResponse.json({ error: "Failed to create transfer" }, { status: 500 })
  }
}
