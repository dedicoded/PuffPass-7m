import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminTrusteeWallet } from "@/lib/auth-enhanced"
import { verifyMessage } from "viem"
import { SignJWT } from "jose"

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
    let sql
    try {
      sql = await getSql()
      console.log("[v0] Database connection established")
    } catch (dbError) {
      console.error("[v0] Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Looking up user by wallet address...")
    let users
    try {
      users = await sql`
        SELECT id, email, name, role, wallet_address
        FROM users
        WHERE LOWER(wallet_address) = LOWER(${walletAddress})
        LIMIT 1
      `
      console.log("[v0] User lookup result:", users.length > 0 ? "Found" : "Not found")
    } catch (queryError) {
      console.error("[v0] User lookup query error:", queryError)
      return NextResponse.json(
        {
          success: false,
          error: "Database query failed",
          details: queryError instanceof Error ? queryError.message : "Unknown query error",
        },
        { status: 500 },
      )
    }

    let user = users[0]

    if (!user) {
      console.log("[v0] Checking if wallet is admin trustee...")
      const isAdminTrustee = await verifyAdminTrusteeWallet(walletAddress)
      const userRole = isAdminTrustee ? "admin" : "customer"
      console.log("[v0] Wallet role determined:", userRole)

      const defaultName = `Wallet_${walletAddress.substring(2, 10)}`

      console.log("[v0] Creating new user with role:", userRole)
      try {
        const newUsers = await sql`
          INSERT INTO users (
            name,
            email,
            wallet_address,
            role,
            password,
            created_at
          ) VALUES (
            ${defaultName},
            ${`${walletAddress}@wallet.puffpass.app`},
            ${walletAddress},
            ${userRole},
            '',
            NOW()
          )
          RETURNING id, email, name, role, wallet_address
        `
        user = newUsers[0]
        console.log("[v0] New user created with ID:", user.id, "and role:", user.role)
      } catch (createError) {
        console.error("[v0] User creation error:", createError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create user",
            details: createError instanceof Error ? createError.message : "Unknown creation error",
          },
          { status: 500 },
        )
      }
    } else {
      console.log("[v0] Checking if existing user should be admin...")
      const isAdminTrustee = await verifyAdminTrusteeWallet(walletAddress)
      console.log("[v0] Admin trustee check result:", isAdminTrustee)

      if (isAdminTrustee && user.role !== "admin") {
        console.log("[v0] Upgrading user role from", user.role, "to admin")
        try {
          const updatedUsers = await sql`
            UPDATE users
            SET role = 'admin'
            WHERE id = ${user.id}
            RETURNING id, email, name, role, wallet_address
          `
          user = updatedUsers[0]
          console.log("[v0] User role updated to:", user.role)
        } catch (updateError) {
          console.error("[v0] Role update error:", updateError)
          // Continue with existing role if update fails
          console.log("[v0] Continuing with existing role:", user.role)
        }
      }
    }

    console.log("[v0] Logging successful authentication...")
    try {
      await sql`
        INSERT INTO age_verification_logs (
          user_id,
          route,
          verified,
          action,
          audit_event,
          created_at
        ) VALUES (
          ${user.id},
          '/api/auth/login',
          true,
          'WALLET_LOGIN_SUCCESS',
          ${JSON.stringify({
            walletAddress,
            role: user.role,
            timestamp: new Date().toISOString(),
          })}::jsonb,
          NOW()
        )
      `
    } catch (logError) {
      console.error("[v0] Audit log error:", logError)
      // Continue even if logging fails
    }

    console.log("[v0] Creating session...")
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret-for-dev",
    )
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
      console.log("[v0] Admin user detected, redirecting to admin dashboard")
    } else if (user.role === "merchant") {
      redirectTo = "/merchant"
      console.log("[v0] Merchant user detected, redirecting to merchant dashboard")
    } else {
      console.log("[v0] Customer user detected, redirecting to consumer dashboard")
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

    console.log("[v0] Session cookie set with name: session")
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
