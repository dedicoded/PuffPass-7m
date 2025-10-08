import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  console.log("[v0] ===== LOGIN API CALLED =====")

  try {
    console.log("[v0] Parsing request body...")
    const body = await request.json()
    console.log("[v0] Request body parsed:", {
      hasWalletAddress: !!body.walletAddress,
      hasSignature: !!body.signature,
      hasMessage: !!body.message,
    })

    const { walletAddress, signature, message } = body

    if (!walletAddress || !signature || !message) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Dynamically importing viem for signature verification...")
    const { verifyMessage } = await import("viem")
    console.log("[v0] Viem imported successfully")

    console.log("[v0] Verifying signature...")
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })
    console.log("[v0] Signature verification result:", isValid)

    if (!isValid) {
      console.log("[v0] Invalid signature")
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 })
    }

    console.log("[v0] Getting database connection...")
    const sql = await getSql()
    console.log("[v0] Database connection established")

    console.log("[v0] Looking up user by wallet address...")
    const users = await sql`
      SELECT id, email, name, role, wallet_address, embedded_wallet, kyc_status
      FROM users
      WHERE LOWER(wallet_address) = LOWER(${walletAddress})
      LIMIT 1
    `
    console.log("[v0] User lookup result:", users.length > 0 ? "Found" : "Not found")

    let user = users[0]

    if (!user) {
      console.log("[v0] Creating new user...")
      const newUsers = await sql`
        INSERT INTO users (
          email,
          wallet_address,
          role,
          auth_method,
          created_at
        ) VALUES (
          ${`${walletAddress}@wallet.puffpass.app`},
          ${walletAddress},
          'customer',
          'wallet',
          NOW()
        )
        RETURNING id, email, name, role, wallet_address, embedded_wallet, kyc_status
      `
      user = newUsers[0]
      console.log("[v0] New user created with ID:", user.id)
    }

    console.log("[v0] Logging successful authentication...")
    await sql`
      INSERT INTO audit_logs (
        actor_id,
        actor_type,
        action,
        resource_type,
        resource_id,
        metadata,
        created_at
      ) VALUES (
        ${user.id},
        'user',
        'WALLET_LOGIN_SUCCESS',
        'authentication',
        ${user.id},
        ${JSON.stringify({
          walletAddress,
          role: user.role,
          timestamp: new Date().toISOString(),
        })}::jsonb,
        NOW()
      )
    `

    console.log("[v0] Creating session...")
    const { SignJWT } = await import("jose")
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-for-dev")
    const token = await new SignJWT({
      userId: user.id,
      walletAddress: user.wallet_address,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret)

    console.log("[v0] Session token created")

    let redirectTo = "/consumer"
    if (user.role === "admin") {
      redirectTo = "/admin"
    } else if (user.role === "merchant") {
      redirectTo = "/merchant"
    }

    console.log("[v0] Login successful, redirecting to:", redirectTo)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.wallet_address,
      },
      redirectTo,
    })

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("[v0] ===== LOGIN SUCCESSFUL =====")
    return response
  } catch (error) {
    console.error("[v0] ===== LOGIN ERROR =====")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
