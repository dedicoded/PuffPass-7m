import { type NextRequest, NextResponse } from "next/server"
import { cybridConfig } from "@/lib/cybrid-config"

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 })
    }

    const token = await getCybridToken()
    const apiUrl = cybridConfig.apiUrl || "https://bank.sandbox.cybrid.app"

    const response = await fetch(`${apiUrl}/api/transfers?customer_guid=${customerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch transfers")
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      transfers: data.objects || [],
      total: data.total || 0,
    })
  } catch (error) {
    console.error("[v0] Error fetching transfers:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch transfers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
