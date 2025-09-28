import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Fetching Merchant Vault Contribution - live data")

    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized - Merchant access required" }, { status: 401 })
    }

    // Get this merchant's contributions to the Puff Vault
    const merchantContributions = await sql`
      SELECT 
        SUM(amount) as total_contribution,
        SUM(CASE WHEN source = 'withdrawal_fee' THEN amount ELSE 0 END) as withdrawal_fees,
        SUM(CASE WHEN source = 'transaction_fee' THEN amount ELSE 0 END) as transaction_fees,
        COUNT(*) as contribution_count,
        MAX(timestamp) as last_contribution
      FROM puff_vault 
      WHERE merchant_id = ${session.id}
    `

    // Calculate impact metrics (estimated)
    const totalContribution = Number.parseFloat(merchantContributions[0]?.total_contribution || 0)
    const estimatedCustomerPaymentsCovered = Math.floor(totalContribution / 2.5) // Avg $2.50 per payment fee
    const estimatedPuffPointsFunded = Math.floor((totalContribution * 0.1) / 0.01) // 10% to rewards, $0.01 per point

    const responseData = {
      total_contribution: totalContribution,
      breakdown: {
        withdrawal_fees: Number.parseFloat(merchantContributions[0]?.withdrawal_fees || 0),
        transaction_fees: Number.parseFloat(merchantContributions[0]?.transaction_fees || 0),
      },
      contribution_stats: {
        contribution_count: Number.parseInt(merchantContributions[0]?.contribution_count || 0),
        last_contribution: merchantContributions[0]?.last_contribution,
      },
      impact_metrics: {
        customer_payments_covered: estimatedCustomerPaymentsCovered,
        puff_points_funded: estimatedPuffPointsFunded,
        customer_loyalty_boost: Math.min(95, 60 + Math.floor(totalContribution / 100)), // Simulated loyalty %
        repeat_purchase_increase: Math.min(85, 40 + Math.floor(totalContribution / 150)), // Simulated repeat %
      },
      last_updated: new Date().toISOString(),
    }

    console.log("[v0] Merchant Vault Contribution fetched successfully")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Merchant Vault Contribution error:", error)
    return NextResponse.json({ error: "Failed to fetch vault contribution data" }, { status: 500 })
  }
}
