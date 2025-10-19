import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  console.log("[v0] ===== SESSION ROUTE GET CALLED =====")

  try {
    console.log("[v0] Request URL:", request.url)
    console.log("[v0] Request method:", request.method)

    // Check if this is a token-based session setup request
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    console.log("[v0] Token parameter:", token ? `Present (${token.substring(0, 20)}...)` : "Missing")

    if (token) {
      console.log("[v0] Setting session cookie from token...")

      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret-for-dev",
      )
      console.log("[v0] Secret key length:", secret.length)

      try {
        // Verify the token
        console.log("[v0] Verifying token...")
        const { payload } = await jwtVerify(token, secret)
        console.log("[v0] Token verified successfully, payload:", {
          userId: payload.userId,
          role: payload.role,
        })

        // Create response with session cookie
        const response = NextResponse.json(
          {
            success: true,
            user: {
              id: payload.userId,
              walletAddress: payload.walletAddress,
              role: payload.role,
            },
          },
          { status: 200 },
        )

        response.cookies.set("session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        })

        // Also set admin-trustee-token for admin users
        if (payload.role === "admin") {
          response.cookies.set("admin-trustee-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          })
          console.log("[v0] Admin token also set")
        }

        console.log("[v0] Session cookie set successfully with name 'session'")
        console.log("[v0] ===== SESSION ROUTE SUCCESS =====")
        return response
      } catch (verifyError) {
        console.error("[v0] Token verification failed:", verifyError)
        console.error("[v0] Token verification error details:", {
          name: verifyError instanceof Error ? verifyError.name : "Unknown",
          message: verifyError instanceof Error ? verifyError.message : String(verifyError),
        })
        console.log("[v0] ===== SESSION ROUTE FAILED =====")
        return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
      }
    }

    console.log("[v0] No token parameter, fetching existing session...")
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
      console.log("[v0] No existing session found")
      return NextResponse.json({ user: null }, { status: 200 })
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret-for-dev",
      )
      const { payload } = await jwtVerify(sessionCookie, secret)

      console.log("[v0] Existing session found")
      return NextResponse.json({
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        },
      })
    } catch (verifyError) {
      console.log("[v0] Existing session invalid")
      return NextResponse.json({ user: null }, { status: 200 })
    }
  } catch (error) {
    console.error("[v0] Session route error:", error)
    console.error("[v0] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    console.log("[v0] ===== SESSION ROUTE ERROR =====")
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
