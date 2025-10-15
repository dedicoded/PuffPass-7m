import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret-for-dev",
    )

    const { payload } = await jwtVerify(sessionToken, secret)

    return NextResponse.json({
      userId: payload.userId,
      role: payload.role,
      walletAddress: payload.walletAddress,
    })
  } catch (error) {
    console.error("Session verification failed:", error)
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }
}
