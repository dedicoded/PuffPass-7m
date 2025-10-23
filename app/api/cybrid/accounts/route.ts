import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface CybridAccount {
  guid: string
  type: string
  asset: string
  balance: string
  available: string
  state: string
  created_at: string
  updated_at: string
}

export async function GET() {
  try {
    console.log("[v0] Fetching Cybrid accounts")

    const apiUrl = process.env.CYBRID_API_URL || "https://bank.sandbox.cybrid.app"
    const clientId = process.env.CYBRID_CLIENT_ID
    const clientSecret = process.env.CYBRID_CLIENT_SECRET
    const bankGuid = process.env.CYBRID_BANK_GUID
    const orgGuid = process.env.CYBRID_ORG_GUID

    if (!clientId || !clientSecret || !bankGuid || !orgGuid) {
      return NextResponse.json({ error: "Cybrid credentials not configured" }, { status: 500 })
    }

    // Get OAuth token
    const tokenResponse = await fetch(`${apiUrl}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: `organizations:${orgGuid} banks:${bankGuid}`,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error("[v0] Cybrid OAuth error:", error)
      return NextResponse.json({ error: "Failed to authenticate with Cybrid" }, { status: 500 })
    }

    const { access_token } = await tokenResponse.json()

    // Fetch accounts
    const accountsResponse = await fetch(`${apiUrl}/api/accounts?bank_guid=${bankGuid}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!accountsResponse.ok) {
      const error = await accountsResponse.text()
      console.error("[v0] Failed to fetch accounts:", error)
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
    }

    const accountsData = await accountsResponse.json()
    const accounts: CybridAccount[] = accountsData.objects || []

    // Add configured account GUIDs
    const configuredAccounts = {
      reserve: process.env.CYBRID_RESERVE_ACCOUNT_GUID,
      gas: process.env.CYBRID_GAS_ACCOUNT_GUID,
      fee: process.env.CYBRID_FEE_ACCOUNT_GUID,
    }

    console.log("[v0] Fetched", accounts.length, "Cybrid accounts")

    return NextResponse.json({
      success: true,
      accounts,
      configured: configuredAccounts,
      bank: {
        guid: bankGuid,
        name: "PuffCash",
      },
    })
  } catch (error: any) {
    console.error("[v0] Error fetching Cybrid accounts:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
