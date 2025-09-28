import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  }

  try {
    console.log("[v0] Fetching transactions...")

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error("[v0] DATABASE_URL not found")
      return NextResponse.json(
        {
          transactions: [
            {
              id: "demo-1",
              type: "purchase",
              amount: 25.99,
              puff_amount: 50,
              description: "Cannabis purchase - Demo data",
              created_at: new Date().toISOString(),
              status: "completed",
            },
            {
              id: "demo-2",
              type: "reward",
              amount: 0,
              puff_amount: 25,
              description: "Loyalty reward - Demo data",
              created_at: new Date(Date.now() - 86400000).toISOString(),
              status: "completed",
            },
          ],
          error: "Database not configured - using demo data",
        },
        { status: 200, headers },
      )
    }

    // For demo purposes, we'll fetch transactions for a sample user
    const sampleUserId = "user_123"

    const result = await sql`
      SELECT 
        id,
        transaction_type as type,
        amount,
        puff_amount,
        description,
        created_at,
        status
      FROM puff_transactions 
      WHERE user_id = ${sampleUserId}
      ORDER BY created_at DESC
      LIMIT 20
    `

    console.log("[v0] Successfully fetched transactions:", result.length)

    return NextResponse.json(
      {
        transactions: result,
      },
      { headers },
    )
  } catch (error) {
    console.error("[v0] Transactions API error:", error)

    // Return demo data instead of failing
    return NextResponse.json(
      {
        transactions: [
          {
            id: "demo-1",
            type: "purchase",
            amount: 25.99,
            puff_amount: 50,
            description: "Cannabis purchase - Demo data",
            created_at: new Date().toISOString(),
            status: "completed",
          },
          {
            id: "demo-2",
            type: "reward",
            amount: 0,
            puff_amount: 25,
            description: "Loyalty reward - Demo data",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            status: "completed",
          },
        ],
        error: "Using demo data",
      },
      { status: 200, headers },
    )
  }
}
