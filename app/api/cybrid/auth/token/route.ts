import { NextResponse } from "next/server"
import { cybridConfig } from "@/lib/cybrid-config"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Generate customer bearer token for Cybrid SDK
export async function GET() {
  const clientId = process.env.CYBRID_CLIENT_ID || cybridConfig.clientId
  const clientSecret = process.env.CYBRID_CLIENT_SECRET || cybridConfig.clientSecret
  const authUrl = process.env.CYBRID_AUTH_URL || cybridConfig.authUrl

  console.log("[v0] Cybrid auth diagnostics:", {
    envVarsPresent: {
      clientId: !!process.env.CYBRID_CLIENT_ID,
      clientSecret: !!process.env.CYBRID_CLIENT_SECRET,
      authUrl: !!process.env.CYBRID_AUTH_URL,
    },
    credentialSuffixes: {
      clientIdSuffix: clientId?.slice(-4) || "none",
      clientSecretSuffix: clientSecret?.slice(-4) || "none",
    },
    credentialLengths: {
      clientIdLength: clientId?.length || 0,
      clientSecretLength: clientSecret?.length || 0,
    },
    runtime: process.env.NEXT_RUNTIME || "nodejs",
    nodeVersion: process.versions?.node || "unknown",
    usingFallback: !process.env.CYBRID_CLIENT_ID || !process.env.CYBRID_CLIENT_SECRET,
    authUrl: authUrl,
  })

  if (!clientId || !clientSecret) {
    console.error("[v0] Missing Cybrid credentials")
    return NextResponse.json(
      {
        error: "server_misconfig",
        error_description:
          "Missing CYBRID_CLIENT_ID or CYBRID_CLIENT_SECRET. These must be set as server-side environment variables.",
      },
      { status: 500 },
    )
  }

  try {
    const trimmedClientId = clientId.trim()
    const trimmedClientSecret = clientSecret.trim()

    const tokenUrl = `${authUrl}/oauth/token`

    console.log("[v0] Attempting client_secret_basic authentication...")
    const basic = Buffer.from(`${trimmedClientId}:${trimmedClientSecret}`, "ascii").toString("base64")

    let response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }).toString(),
      cache: "no-store",
    })

    if (response.status === 401) {
      console.log("[v0] client_secret_basic failed with 401, retrying with client_secret_post...")

      response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: trimmedClientId,
          client_secret: trimmedClientSecret,
        }).toString(),
        cache: "no-store",
      })
    }

    const responseText = await response.text()

    if (!response.ok) {
      console.error("[v0] Cybrid OAuth failed:", response.status, responseText)
      console.error("[v0] Both auth methods failed. This indicates invalid credentials.")
      console.error(
        "[v0] If using fallback credentials, they may be expired. Set CYBRID_CLIENT_ID and CYBRID_CLIENT_SECRET in your deployment environment.",
      )

      // Forward the error response from Cybrid
      return new NextResponse(responseText || JSON.stringify({ error: "oauth_failed" }), {
        status: response.status,
        headers: { "content-type": response.headers.get("content-type") || "application/json" },
      })
    }

    const data = JSON.parse(responseText)
    console.log("[v0] Cybrid OAuth token obtained successfully")

    return NextResponse.json({
      token: data.access_token,
      bankGuid: process.env.CYBRID_BANK_GUID || cybridConfig.bankGuid,
      environment: process.env.CYBRID_ENVIRONMENT || cybridConfig.environment,
    })
  } catch (error) {
    console.error("[v0] Error in Cybrid OAuth flow:", error)
    return NextResponse.json(
      {
        error: "internal_error",
        error_description: error instanceof Error ? error.message : "Failed to obtain Cybrid token",
      },
      { status: 500 },
    )
  }
}
