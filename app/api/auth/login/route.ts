import { type NextRequest, NextResponse } from "next/server"
import { verifyUserPassword } from "@/lib/auth-utils"
import { createSession } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login API called")

    let email: string, password: string
    try {
      const body = await request.json()
      email = body.email
      password = body.password
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
        },
        { status: 400 },
      )
    }

    // Validate input
    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Verifying credentials for:", email)

    let user
    try {
      user = await verifyUserPassword(email, password)
    } catch (dbError) {
      console.error("[v0] Database error during password verification:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Authentication service temporarily unavailable",
        },
        { status: 500 },
      )
    }

    if (!user) {
      console.log("[v0] Invalid credentials for:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    console.log("[v0] User verified, creating session")

    try {
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      })

      await createSession(user, response)
      console.log("[v0] Login successful for user:", user.id)
      return response
    } catch (sessionError) {
      console.error("[v0] Session creation error:", sessionError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create session",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Unexpected login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
