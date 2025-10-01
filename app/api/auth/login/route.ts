import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword, getUserByWallet, createUser } from "@/lib/db"
import { createSession, verifyAdminWallet } from "@/lib/auth"
import { verifyPasskey, createEmbeddedWallet } from "@/lib/auth-enhanced"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Enhanced login API called")

    const body = await request.json()
    const { loginType, email, password, walletAddress, signature, passkeyCredential, userType } = body

    // If no loginType specified, assume email/password login
    if (!loginType && email && password) {
      return await handleEmailPasswordLogin(email, password, userType || "customer")
    }

    switch (loginType) {
      case "wallet":
        return await handleWalletLogin(walletAddress, signature, userType)

      case "email_passkey":
        return await handleEmailPasskeyLogin(email, passkeyCredential, userType)

      case "email_password":
        return await handleEmailPasswordLogin(email, password, userType)

      case "admin_wallet":
        return await handleAdminWalletLogin(walletAddress, signature)

      default:
        return NextResponse.json({ success: false, error: "Invalid login type" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Unexpected login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

async function handleWalletLogin(walletAddress: string, signature: string, userType: "consumer" | "merchant") {
  try {
    // Verify wallet signature
    const isValidSignature = await verifyWalletSignature(walletAddress, signature)
    if (!isValidSignature) {
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

    // Get or create user
    let user = await getUserByWallet(walletAddress)
    if (!user) {
      // Create new user with wallet
      user = await createUser({
        email: `${walletAddress}@wallet.puffpass.app`,
        walletAddress,
        role: userType === "merchant" ? "merchant" : "customer",
        authMethod: "wallet",
      })
    }

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

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      requiresKYC: shouldTriggerKYC(user),
      embeddedWallet: user.embeddedWallet,
    })

    await createSession(user, response)
    return response
  } catch (error) {
    console.error("[v0] Wallet login error:", error)
    return NextResponse.json({ success: false, error: "Wallet authentication failed" }, { status: 500 })
  }
}

async function handleEmailPasskeyLogin(email: string, passkeyCredential: any, userType: "consumer" | "merchant") {
  try {
    // Verify passkey
    const passkeyResult = await verifyPasskey(email, passkeyCredential)
    if (!passkeyResult.success) {
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
    // Basic validation
    if (!walletAddress || !signature) {
      return false
    }

    // Validate wallet address format (Ethereum address)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(walletAddress)) {
      return false
    }

    // Validate signature format
    const signatureRegex = /^0x[a-fA-F0-9]{130}$/
    if (!signatureRegex.test(signature)) {
      return false
    }

    // TODO: Implement actual signature verification using ethers.js or viem
    // This would involve:
    // 1. Reconstructing the original message that was signed
    // 2. Using ethers.verifyMessage() or similar to verify the signature
    // 3. Comparing the recovered address with the provided walletAddress

    // For now, return true for valid format (placeholder for actual verification)
    console.log("[v0] Wallet signature verification - format validated, awaiting full implementation")
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
