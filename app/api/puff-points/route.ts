import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUserPuffPoints } from "@/lib/db"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const balance = await getUserPuffPoints(session.id)

    // Get recent transactions
    const transactions = await sql`
      SELECT 
        points_earned,
        points_spent,
        transaction_type,
        transaction_description,
        created_at
      FROM puff_points 
      WHERE user_id = ${session.id}
      ORDER BY created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      balance,
      transactions,
    })
  } catch (error) {
    console.error("[v0] Get puff points error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
