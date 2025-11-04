import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { cybridConfig } from "@/lib/cybrid-config"

const sql = neon(process.env.DATABASE_URL!)

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function getCybridToken(): Promise<string> {
  const response = await fetch("/api/cybrid/auth/token")
  if (!response.ok) {
    throw new Error("Failed to get Cybrid auth token")
  }
  const { token } = await response.json()
  return token
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, amount, asset, sourceAccountGuid, destinationAccountGuid, externalBankAccountGuid } =
      await request.json()

    console.log("[v0] Creating Cybrid transfer:", {
      customerId,
      amount,
      asset,
      sourceAccountGuid,
      destinationAccountGuid,
      externalBankAccountGuid,
    })

    // Get OAuth token
    const token = await getCybridToken()

    const apiUrl = cybridConfig.apiUrl || "https://bank.sandbox.cybrid.app"
    const bankGuid = cybridConfig.bankGuid

    // Create transfer via Cybrid API
    const transferResponse = await fetch(`${apiUrl}/api/transfers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transfer_type: externalBankAccountGuid ? "funding" : "book", // funding = external, book = internal
        customer_guid: customerId,
        source_account_guid: sourceAccountGuid,
        destination_account_guid: destinationAccountGuid,
        external_bank_account_guid: externalBankAccountGuid,
        asset: asset || "USD",
        amount: Math.floor(amount * 100), // Convert to cents
        bank_guid: bankGuid,
      }),
    })

    if (!transferResponse.ok) {
      const errorText = await transferResponse.text()
      console.error("[v0] Cybrid transfer failed:", errorText)
      throw new Error(`Failed to create transfer: ${transferResponse.status} - ${errorText}`)
    }

    const transfer = await transferResponse.json()

    console.log("[v0] Cybrid transfer created:", transfer.guid)

    // Store transfer record in database
    await sql`
      INSERT INTO crypto_transactions (
        user_id,
        cybrid_transfer_id,
        amount,
        asset,
        transfer_type,
        source_account_guid,
        destination_account_guid,
        external_bank_account_guid,
        status,
        created_at
      ) VALUES (
        (SELECT id FROM users WHERE cybrid_customer_id = ${customerId}),
        ${transfer.guid},
        ${amount},
        ${asset || "USD"},
        ${transfer.transfer_type},
        ${sourceAccountGuid},
        ${destinationAccountGuid || null},
        ${externalBankAccountGuid || null},
        ${transfer.state},
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      transferId: transfer.guid,
      status: transfer.state,
      transferType: transfer.transfer_type,
      amount: transfer.amount / 100, // Convert back from cents
      asset: transfer.asset,
      createdAt: transfer.created_at,
    })
  } catch (error) {
    console.error("[v0] Error creating Cybrid transfer:", error)
    return NextResponse.json(
      {
        error: "Failed to create transfer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
