import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword, getUserByWallet, createUser, getSql } from "@/lib/db"
import { createSession, verifyAdminWallet } from "@/lib/auth"
import { verifyPasskey, createEmbeddedWallet } from "@/lib/auth-enhanced"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ===== LOGIN API CALLED =====")
    console.log("[v0] Request URL:", request.url)
    console.log("[v0] Request method:", request.method)

    let body
    try {
      body = await request.json()
      console.log("[v0] Request body parsed successfully")
      console.log("[v0] Login type:", body.loginType)
      console.log("[v0] Has email:", !!body.email)
      console.log("[v0] Has password:", !!body.password)
      console.log("[v0] Has walletAddress:", !!body.walletAddress)
      console.log("[v0] Has signature:", !!body.signature)
      console.log("[v0] User type:", body.userType)
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { loginType, email, password, walletAddress, signature, passkeyCredential, userType } = body

    // If no loginType specified, assume email/password login
    if (!loginType && email && password) {
      console.log("[v0] No loginType specified, defaulting to email/password")
      return await handleEmailPasswordLogin(email, password, userType || "customer")
    }

    console.log("[v0] Processing login type:", loginType)

    switch (loginType) {
      case "wallet":
        console.log("[v0] Routing to wallet login handler")
        return await handleWalletLogin(walletAddress, signature, userType)

      case "email_passkey":
        console.log("[v0] Routing to email passkey login handler")
        return await handleEmailPasskeyLogin(email, passkeyCredential, userType)

      case "email_password":
        console.log("[v0] Routing to email password login handler")
        return await handleEmailPasswordLogin(email, password, userType)

      case "admin_wallet":
        console.log("[v0] Routing to admin wallet login handler")
        return await handleAdminWalletLogin(walletAddress, signature)

      default:
        console.log("[v0] Invalid login type:", loginType)
        return NextResponse.json({ success: false, error: "Invalid login type" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] ===== UNEXPECTED LOGIN ERROR =====")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Full error object:", error)
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

async function handleWalletLogin(walletAddress: string, signature: string, userType: "consumer" | "merchant") {
  try {
    console.log("[v0] Starting wallet login for:", walletAddress)

    // Verify wallet signature
    const isValidSignature = await verifyWalletSignature(walletAddress, signature)
    if (!isValidSignature) {
      console.log("[v0] Invalid wallet signature")
      const sql = getSql()
      await sql`
        INSERT INTO audit_logs (
          actor_id,
          actor_type,
          action,
          resource_type,
          metadata
        ) VALUES (
          ${null},
          'system',
          'WALLET_LOGIN_FAILED',
          'authentication',
          ${JSON.stringify({
            walletAddress,
            reason: "Invalid signature",
            timestamp: new Date().toISOString(),
          })}::jsonb
        )
      `
      return NextResponse.json({ success: false, error: "Invalid wallet signature" }, { status: 401 })
    }

    console.log("[v0] Wallet signature verified, looking up user")

    // Get or create user
    let user = await getUserByWallet(walletAddress)
    if (!user) {
      console.log("[v0] User not found, creating new user")
      // Create new user with wallet
      user = await createUser({
        email: `${walletAddress}@wallet.puffpass.app`,
        walletAddress,
        role: userType === "merchant" ? "merchant" : "customer",
        authMethod: "wallet",
      })
      console.log("[v0] New user created:", user.id)
    } else {
      console.log("[v0] Existing user found:", user.id)
    }

    const sql = getSql()
    await sql`
      INSERT INTO audit_logs (
        actor_id,
        actor_type,
        action,
        resource_type,
        resource_id,
        metadata
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
        })}::jsonb
      )
    `

    console.log("[v0] Creating session for user:", user.id)

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      requiresKYC: shouldTriggerKYC(user),
      embeddedWallet: user.embeddedWallet,
    })

    await createSession(user, response)
    console.log("[v0] Session created successfully")
    return response
  } catch (error) {
    console.error("[v0] Wallet login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Wallet authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function handleEmailPasskeyLogin(email: string, passkeyCredential: any, userType: "consumer" | "merchant") {
  try {
    // Verify passkey
    const passkeyResult = await verifyPasskey(email, passkeyCredential)
    if (!passkeyResult.success) {
      const sql = getSql()
      await sql`
        INSERT INTO audit_logs (
          actor_id,
          actor_type,
          action,
          resource_type,
          metadata
        ) VALUES (
          ${null},
          'system',
          'PASSKEY_LOGIN_FAILED',
          'authentication',
          ${JSON.stringify({
            email,
            reason: "Invalid passkey",
            timestamp: new Date().toISOString(),
          })}::jsonb
        )
      `
      return NextResponse.json({ success: false, error: "Invalid passkey" }, { status: 401 })
    }

    let user = passkeyResult.user
    if (!user) {
      // Create embedded wallet for new user
      const embeddedWallet = await createEmbeddedWallet()
      user = await createUser({
        email,
        role: userType === "merchant" ? "merchant" : "customer",
        authMethod: "passkey",
        embeddedWallet: embeddedWallet.address,
      })
    }

    const sql = getSql()
    await sql`
      INSERT INTO audit_logs (
        actor_id,
        actor_type,
        action,
        resource_type,
        resource_id,
        metadata
      ) VALUES (
        ${user.id},
        'user',
        'PASSKEY_LOGIN_SUCCESS',
        'authentication',
        ${user.id},
        ${JSON.stringify({
          email,
          role: user.role,
          timestamp: new Date().toISOString(),
        })}::jsonb
      )
    `

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      requiresKYC: shouldTriggerKYC(user),
      embeddedWallet: user.embeddedWallet,
    })

    await createSession(user, response)
    return response
  } catch (error) {
    console.error("[v0] Passkey login error:", error)
    return NextResponse.json({ success: false, error: "Passkey authentication failed" }, { status: 500 })
  }
}

async function handleEmailPasswordLogin(email: string, password: string, userType: "consumer" | "merchant") {
  try {
    const user = await verifyPassword(email, password)
    if (!user) {
      const sql = getSql()
      await sql`
        INSERT INTO audit_logs (
          actor_id,
          actor_type,
          action,
          resource_type,
          metadata
        ) VALUES (
          ${null},
          'system',
          'EMAIL_LOGIN_FAILED',
          'authentication',
          ${JSON.stringify({
            email,
            reason: "Invalid credentials",
            timestamp: new Date().toISOString(),
          })}::jsonb
        )
      `
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user role matches requested type
    if (userType === "merchant" && user.role !== "merchant") {
      return NextResponse.json({ success: false, error: "Invalid merchant credentials" }, { status: 401 })
    }

    const sql = getSql()
    await sql`
      INSERT INTO audit_logs (
        actor_id,
        actor_type,
        action,
        resource_type,
        resource_id,
        metadata
      ) VALUES (
        ${user.id},
        'user',
        'EMAIL_LOGIN_SUCCESS',
        'authentication',
        ${user.id},
        ${JSON.stringify({
          email,
          role: user.role,
          requiresMFA: user.role === "merchant" && shouldRequireMFA(user),
          timestamp: new Date().toISOString(),
        })}::jsonb
      )
    `

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      requiresKYC: shouldTriggerKYC(user),
      requiresMFA: user.role === "merchant" && shouldRequireMFA(user),
    })

    await createSession(user, response)
    return response
  } catch (error) {
    console.error("[v0] Email/password login error:", error)
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}

async function handleAdminWalletLogin(walletAddress: string, signature: string) {
  try {
    const isValidAdmin = await verifyAdminWallet(walletAddress, signature)
    if (!isValidAdmin) {
      const sql = getSql()
      await sql`
        INSERT INTO audit_logs (
          actor_id,
          actor_type,
          action,
          resource_type,
          metadata
        ) VALUES (
          ${null},
          'system',
          'ADMIN_LOGIN_FAILED',
          'authentication',
          ${JSON.stringify({
            walletAddress,
            reason: "Unauthorized admin access",
            timestamp: new Date().toISOString(),
          })}::jsonb
        )
      `
      return NextResponse.json({ success: false, error: "Unauthorized admin access" }, { status: 403 })
    }

    const user = await getUserByWallet(walletAddress)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin user not found" }, { status: 404 })
    }

    const sql = getSql()
    await sql`
      INSERT INTO audit_logs (
        actor_id,
        actor_type,
        action,
        resource_type,
        resource_id,
        metadata
      ) VALUES (
        ${user.id},
        'admin',
        'ADMIN_LOGIN_SUCCESS',
        'authentication',
        ${user.id},
        ${JSON.stringify({
          walletAddress,
          sessionDuration: "short",
          timestamp: new Date().toISOString(),
        })}::jsonb
      )
    `

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      sessionDuration: "short", // Admin sessions are shorter
    })

    await createSession(user, response, { duration: "1h", auditLog: true })
    return response
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ success: false, error: "Admin authentication failed" }, { status: 500 })
  }
}

async function verifyWalletSignature(walletAddress: string, signature: string): Promise<boolean> {
  try {
    console.log("[v0] Verifying wallet signature")
    console.log("[v0] Wallet address:", walletAddress)
    console.log("[v0] Signature:", signature)
    console.log("[v0] Signature length:", signature?.length)

    // Basic validation
    if (!walletAddress || !signature) {
      console.log("[v0] Missing wallet address or signature")
      return false
    }

    // Validate wallet address format (Ethereum address)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(walletAddress)) {
      console.log("[v0] Invalid wallet address format")
      return false
    }

    // Signature should start with 0x and be a hex string
    if (!signature.startsWith("0x") || !/^0x[a-fA-F0-9]+$/.test(signature)) {
      console.log("[v0] Invalid signature format")
      return false
    }

    // TODO: Implement actual signature verification using ethers.js or viem
    // This would involve:
    // 1. Reconstructing the original message that was signed
    // 2. Using ethers.verifyMessage() or similar to verify the signature
    // 3. Comparing the recovered address with the provided walletAddress

    // For now, return true for valid format (placeholder for actual verification)
    console.log("[v0] Wallet signature format validated successfully")
    return true
  } catch (error) {
    console.error("[v0] Wallet signature verification error:", error)
    return false
  }
}

function shouldTriggerKYC(user: any): boolean {
  const totalTransactionVolume = user.totalTransactionVolume ?? 0
  const riskScore = user.riskScore ?? 0
  return totalTransactionVolume > 1000 || riskScore > 0.7
}

function shouldRequireMFA(user: any): boolean {
  if (user.role !== "merchant") {
    return false
  }

  const lastMFACheck = user.lastMFACheck ? new Date(user.lastMFACheck).getTime() : 0
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

  return lastMFACheck < oneDayAgo
}
