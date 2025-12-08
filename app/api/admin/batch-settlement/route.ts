import { type NextRequest, NextResponse } from "next/server"
import { polygonBatchService } from "@/lib/polygon-batch-service"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Manual batch settlement triggered")

    // Execute batch settlement
    const result = await polygonBatchService.executeBatchSettlement()

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error("[v0] Batch settlement API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get settlement history
    const history = await polygonBatchService.getSettlementHistory()

    return NextResponse.json({
      success: true,
      data: history,
    })
  } catch (error: any) {
    console.error("[v0] Settlement history API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
