import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In production, fetch from database
    // For now, return mock data
    const stats = {
      totalTransactions: 1247,
      blockedTransactions: 23,
      flaggedAddresses: 5,
      averageRiskScore: 18.5,
    }

    const alerts = [
      {
        type: "High Velocity Transaction",
        severity: "Medium",
        description: "Address 0x742d...3f8a made 8 transactions in 2 minutes",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        type: "Large Transaction",
        severity: "Low",
        description: "Transaction of 15,000 USDC detected from 0x8b3c...9d2e",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ]

    return NextResponse.json({ success: true, stats, alerts })
  } catch (error: any) {
    console.error("[v0] Security stats error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
