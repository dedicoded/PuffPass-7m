import { type NextRequest, NextResponse } from "next/server"
import { polygonBatchService } from "@/lib/polygon-batch-service"

// This endpoint should be called by a cron job daily
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Daily cron settlement triggered")

    // Execute batch settlement
    const result = await polygonBatchService.executeBatchSettlement()

    return NextResponse.json({
      success: result.success,
      data: result,
    })
  } catch (error: any) {
    console.error("[v0] Cron settlement error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
