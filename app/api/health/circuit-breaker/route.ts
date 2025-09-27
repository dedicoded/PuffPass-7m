import { NextResponse } from "next/server"
import { getCircuitBreakerStatus } from "@/lib/db-with-circuit-breaker"

export async function GET() {
  try {
    const status = getCircuitBreakerStatus()

    return NextResponse.json({
      success: true,
      circuitBreakers: status,
      healthy: status.read.state === "CLOSED" && status.write.state === "CLOSED",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get circuit breaker status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
