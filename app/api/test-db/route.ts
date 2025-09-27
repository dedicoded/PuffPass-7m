import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Testing database connection")

    const result = await sql`SELECT 1 as test`
    console.log("[v0] Database test result:", result)

    return NextResponse.json({
      success: true,
      message: "Database connection working",
      result: result[0],
    })
  } catch (error) {
    console.error("[v0] Database test error:", error)
    const errorMessage = error instanceof Error ? error.message : "Database connection failed"
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
