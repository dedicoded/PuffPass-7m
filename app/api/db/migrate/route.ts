import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Migration API endpoint called")

    const body = await request.json()
    const { script, scriptName } = body

    if (!script || !scriptName) {
      return NextResponse.json(
        {
          status: "error",
          message: "Script content and name are required",
        },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("[v0] Executing migration script:", scriptName)

    const sql = getSql()

    // Execute the SQL script within a transaction
    await sql.transaction(async (tx) => {
      // Split script into individual statements and execute each
      const statements = script
        .split(";")
        .map((stmt: string) => stmt.trim())
        .filter((stmt: string) => stmt.length > 0 && !stmt.startsWith("--"))

      for (const statement of statements) {
        if (statement.trim()) {
          console.log("[v0] Executing statement:", statement.substring(0, 100) + "...")
          await tx.unsafe(statement)
        }
      }
    })

    console.log("[v0] Migration completed successfully")

    return NextResponse.json(
      {
        status: "success",
        applied: scriptName,
        message: "Migration executed successfully",
      },
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("[v0] Migration failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown migration error",
        details: error instanceof Error ? error.stack : undefined,
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
