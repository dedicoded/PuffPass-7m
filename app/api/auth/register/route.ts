import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSql, createUser, getUserByEmail, getProviderId } from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"
import { createSession } from "@/lib/auth"
import { createEmbeddedWallet } from "@/lib/auth-enhanced"

export const runtime = "nodejs"

console.log("[v0] Registration API route module loaded")

export async function POST(request: NextRequest) {
  console.log("[v0] Registration API POST method called")

  try {
    console.log("[v0] Starting registration process")

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log("[v0] Request body parsed successfully:", Object.keys(body))
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const { name, email, password, role, walletAddress, patientCertification, dcResidency, referralCode } = body

    // Basic validation
    if (!name || !email || !password || !role) {
      console.log("[v0] Missing required fields")
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, password, role" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("[v0] Basic validation passed")

    // Test database connection
    console.log("[v0] Testing database connection...")
    try {
      const sql = await getSql()
      const testResult = await sql`SELECT 1 as test`
      console.log("[v0] Database connection test successful:", testResult)
    } catch (dbError) {
      console.error("[v0] Database connection failed:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: process.env.NODE_ENV === "development" ? String(dbError) : undefined,
        },
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    // Check if user already exists
    console.log("[v0] Checking if user exists...")
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      console.log("[v0] User already exists with email:", email)
      return NextResponse.json(
        { success: false, error: "User already exists with this email" },
        { status: 409, headers: { "Content-Type": "application/json" } },
      )
    }

    // Hash password using auth-utils
    console.log("[v0] Hashing password...")
    const hashedPassword = await hashPassword(password)
    console.log("[v0] Password hashed successfully")

    console.log("[v0] Creating embedded wallet for new user...")
    let embeddedWalletAddress: string | undefined
    try {
      const embeddedWallet = await createEmbeddedWallet()
      embeddedWalletAddress = embeddedWallet.address
      console.log("[v0] Embedded wallet created:", embeddedWalletAddress)
    } catch (walletError) {
      console.error("[v0] Failed to create embedded wallet:", walletError)
      // Continue without embedded wallet - it's not critical for registration
    }

    console.log("[v0] Creating user...")
    const newUser = await createUser({
      email,
      name,
      role,
      hashedPassword,
      walletAddress,
      authMethod: "password",
      embeddedWallet: embeddedWalletAddress,
      patientCertification,
      dcResidency,
      referralCode,
    })
    console.log("[v0] User created successfully:", { id: newUser.id, email: newUser.email, role: newUser.role })

    if (role === "customer") {
      try {
        console.log("[v0] Creating welcome bonus transaction...")
        const systemProviderId = await getProviderId("system")

        const sql = await getSql()
        await sql`
          INSERT INTO puff_transactions (
            user_id,
            transaction_type,
            amount,
            puff_amount,
            description,
            status,
            provider_id
          ) VALUES (
            ${newUser.id},
            'reward',
            0,
            50,
            'Welcome bonus - Thank you for joining PuffPass!',
            'completed',
            ${systemProviderId}
          )
        `
        console.log("[v0] Welcome bonus created: 50 PUFF")
      } catch (bonusError) {
        console.error("[v0] Failed to create welcome bonus:", bonusError)
        // Non-critical, continue
      }
    }

    console.log("[v0] Creating session for new user...")
    try {
      const response = NextResponse.json(
        {
          success: true,
          message: "User registered successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            wallet_address: newUser.wallet_address,
            embedded_wallet: newUser.embedded_wallet,
            patient_certification: newUser.patient_certification,
            dc_residency: newUser.dc_residency,
            referral_code: newUser.referral_code,
          },
        },
        { status: 201, headers: { "Content-Type": "application/json" } },
      )

      await createSession(newUser, response)
      console.log("[v0] Session created successfully for new user:", newUser.id)
      return response
    } catch (sessionError) {
      console.error("[v0] Session creation error:", sessionError)
      return NextResponse.json(
        {
          success: false,
          error: "User created but failed to create session",
          details: process.env.NODE_ENV === "development" ? String(sessionError) : undefined,
        },
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    console.error("[v0] Error type:", typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        success: false,
        error: "Registration failed",
        details:
          process.env.NODE_ENV === "development"
            ? {
                message: error instanceof Error ? error.message : String(error),
                type: typeof error,
                stack: error instanceof Error ? error.stack : undefined,
              }
            : undefined,
      },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function GET() {
  console.log("[v0] Registration API GET method called - route is working")
  return NextResponse.json(
    {
      message: "Registration API is working",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Content-Type": "application/json" } },
  )
}
