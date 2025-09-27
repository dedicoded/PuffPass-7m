import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { customerId, plaidPublicToken, accountId, metadata } = await request.json()

    const response = await fetch("https://bank.sandbox.cybrid.app/api/external_bank_accounts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CYBRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: metadata.accounts[0].name,
        customer_guid: customerId,
        account_kind: "plaid",
        plaid_public_token: plaidPublicToken,
        plaid_account_id: accountId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create external bank account")
    }

    const bankAccount = await response.json()

    // Store bank account info
    await sql`
      INSERT INTO user_bank_accounts (
        user_id, 
        cybrid_account_id, 
        account_name, 
        account_type,
        status,
        created_at
      ) VALUES (
        (SELECT id FROM users WHERE cybrid_customer_id = ${customerId}),
        ${bankAccount.guid},
        ${bankAccount.name},
        ${bankAccount.account_kind},
        ${bankAccount.state},
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      bankAccountId: bankAccount.guid,
    })
  } catch (error) {
    console.error("Error creating bank account:", error)
    return NextResponse.json({ error: "Failed to create bank account" }, { status: 500 })
  }
}
