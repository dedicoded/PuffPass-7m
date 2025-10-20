import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyMessage } from "viem"
import { SignJWT } from "jose"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

let sql: ReturnType<typeof neon> | null = null

function getSqlConnection() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    sql = neon(process.env.DATABASE_URL)
  }
  return sql
}

function isAdminWallet(walletAddress: string): boolean {
  const trustedWallets = process.env.TRUSTED_WALLETS || ""
  const wallets = trustedWallets.split(",").map((w) => w.trim().toLowerCase())
  return wallets.includes(walletAddress.toLowerCase())
}

export async function POST(request: NextRequest) {
  console.log("[v0] ===== LOGIN API CALLED =====")
  console.log("[v0] Request URL:", request.url)
  console.log("[v0] Request method:", request.method)

  try {
    let body: any
    const contentType = request.headers.get("content-type") || ""

    console.log("[v0] Content-Type:", contentType)

    try {
      if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
        console.log("[v0] Parsing form data...")
        const formData = await request.formData()
        body = {
          walletAddress: formData.get("walletAddress"),
          signature: formData.get("signature"),
          message: formData.get("message"),
        }
      } else {
        console.log("[v0] Parsing JSON body...")
        body = await request.json()
      }
      console.log("[v0] Body parsed successfully")
    } catch (parseError) {
      console.error("[v0] Body parsing error:", parseError)
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { walletAddress, signature, message } = body

    if (!walletAddress || !signature || !message) {
      console.log("[v0] Missing required fields")
      return NextResponse.json(
        { success: false, error: "Missing required fields: walletAddress, signature, message" },
        { status: 400 },
      )
    }

    console.log("[v0] Verifying signature for wallet:", walletAddress)
    let isValid = false
    try {
      isValid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })
      console.log("[v0] Signature verification result:", isValid)
    } catch (verifyError) {
      console.error("[v0] Signature verification error:", verifyError)
      return NextResponse.json({ success: false, error: "Signature verification failed" }, { status: 401 })
    }

    if (!isValid) {
      console.log("[v0] Invalid signature")
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 })
    }

    console.log("[v0] Getting database connection...")
    let sqlClient
    try {
      sqlClient = getSqlConnection()
      console.log("[v0] Database connection established")
    } catch (dbError) {
      console.error("[v0] Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Looking up user by wallet address...")
    let users
    try {
      users = await Promise.race([
        sqlClient`
          SELECT id, email, name, role, wallet_address
          FROM users
          WHERE LOWER(wallet_address) = LOWER(${walletAddress})
          LIMIT 1
        `,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database query timeout")), 10000)),
      ])
      console.log("[v0] User lookup completed:", users.length > 0 ? "Found" : "Not found")
    } catch (queryError) {
      console.error("[v0] User lookup error:", queryError)
      return NextResponse.json(
        {
          success: false,
          error: "Database query failed",
          details: queryError instanceof Error ? queryError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    let user = users[0]

    if (!user) {
      console.log("[v0] User not found, creating new user...")
      const isAdmin = isAdminWallet(walletAddress)
      const userRole = isAdmin ? "admin" : "customer"
      const defaultName = `Wallet_${walletAddress.substring(2, 10)}`

      console.log("[v0] Creating user with role:", userRole)
      try {
        const newUsers = await sqlClient`
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
        console.log("[v0] User created successfully:", user.id)
      } catch (createError) {
        console.error("[v0] User creation error:", createError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create user",
            details: createError instanceof Error ? createError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else {
      console.log("[v0] Existing user found, checking role...")
      const isAdmin = isAdminWallet(walletAddress)
      if (isAdmin && user.role !== "admin") {
        console.log("[v0] Upgrading user to admin role")
        try {
          const updatedUsers = await sqlClient`
            UPDATE users
            SET role = 'admin'
            WHERE id = ${user.id}
            RETURNING id, email, name, role, wallet_address
          `
          user = updatedUsers[0]
          console.log("[v0] User role updated to admin")
        } catch (updateError) {
          console.error("[v0] Role update error:", updateError)
          // Continue with existing role
        }
      }
    }

    console.log("[v0] Creating session token...")
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret-for-dev",
    )

    let token
    try {
      token = await new SignJWT({
        userId: user.id,
        walletAddress: user.wallet_address,
        role: user.role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret)
      console.log("[v0] Token created successfully")
    } catch (tokenError) {
      console.error("[v0] Token creation error:", tokenError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create session token",
        },
        { status: 500 },
      )
    }

    let redirectTo = "/consumer"
    if (user.role === "admin") {
      redirectTo = "/admin"
    } else if (user.role === "merchant") {
      redirectTo = "/merchant"
    }

    console.log("[v0] Login successful, redirecting to:", redirectTo)

    const response = NextResponse.json(
      {
        success: true,
        token,
        redirectTo,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          walletAddress: user.wallet_address,
        },
      },
      { status: 200 },
    )

    console.log("[v0] ===== LOGIN SUCCESSFUL =====")
    return response
  } catch (error) {
    console.error("[v0] ===== LOGIN ERROR =====")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
