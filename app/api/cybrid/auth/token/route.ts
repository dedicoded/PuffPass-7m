import { NextResponse } from "next/server"
import { cybridConfig } from "@/lib/cybrid-config"

export const runtime = "nodejs"

// Generate customer bearer token for Cybrid SDK
export async function GET() {
  try {
    console.log("[v0] Generating Cybrid customer bearer token...")

    if (!cybridConfig.clientId) {
      console.error("[v0] CYBRID_CLIENT_ID is not set")
      return NextResponse.json(
        { error: "Cybrid Client ID is not configured. Please add CYBRID_CLIENT_ID to your environment variables." },
        { status: 500 },
      )
    }

    if (!cybridConfig.clientSecret) {
      console.error("[v0] CYBRID_CLIENT_SECRET is not set")
      return NextResponse.json(
        {
          error:
            "Cybrid Client Secret is not configured. Please add CYBRID_CLIENT_SECRET to your environment variables in Vercel.",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Using Client ID:", cybridConfig.clientId?.substring(0, 10) + "...")
    console.log("[v0] Client ID length:", cybridConfig.clientId?.length)
    console.log("[v0] Client Secret length:", cybridConfig.clientSecret?.length)
    console.log("[v0] Client Secret preview:", cybridConfig.clientSecret?.substring(0, 10) + "...")
    console.log("[v0] Auth URL:", `${cybridConfig.authUrl}/oauth/token`)

    const auth = Buffer.from(`${cybridConfig.clientId}:${cybridConfig.clientSecret}`).toString("base64")
    console.log("[v0] Using Basic Auth (credentials encoded)")
    console.log("[v0] Base64 auth preview:", auth.substring(0, 20) + "...")

    // Get organization bearer token using Basic Auth
    const authResponse = await fetch(`${cybridConfig.authUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        scope: "banks:read customers:read customers:write accounts:read quotes:execute trades:execute",
      }),
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error("[v0] Cybrid auth failed:", errorText)
      console.error("[v0] Response status:", authResponse.status)
      console.error("[v0] Response headers:", Object.fromEntries(authResponse.headers.entries()))

      if (authResponse.status === 401) {
        return NextResponse.json(
          {
            error:
              "Cybrid authentication failed. Please verify your CYBRID_CLIENT_ID and CYBRID_CLIENT_SECRET are correct.",
          },
          { status: 401 },
        )
      }

      throw new Error(`Cybrid authentication failed: ${authResponse.status} - ${errorText}`)
    }

    const { access_token } = await authResponse.json()

    console.log("[v0] Cybrid customer bearer token generated successfully")

    return NextResponse.json({
      token: access_token,
      bankGuid: cybridConfig.bankGuid,
      environment: cybridConfig.environment,
    })
  } catch (error) {
    console.error("[v0] Error generating Cybrid token:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate Cybrid token" },
      { status: 500 },
    )
  }
}
