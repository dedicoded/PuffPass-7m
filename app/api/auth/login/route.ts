import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword, getUserByWallet, createUser } from "@/lib/db"
import { createSession, verifyAdminWallet } from "@/lib/auth"
import { verifyPasskey, createEmbeddedWallet } from "@/lib/auth-enhanced"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Enhanced login API called")

    const body = await request.json()
    const { loginType, email, password, walletAddress, signature, passkeyCredential, userType } = body

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
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user role matches requested type
    if (userType === "merchant" && user.role !== "merchant") {
      return NextResponse.json({ success: false, error: "Invalid merchant credentials" }, { status: 401 })
    }

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
      return NextResponse.json({ success: false, error: "Unauthorized admin access" }, { status: 403 })
    }

    const user = await getUserByWallet(walletAddress)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin user not found" }, { status: 404 })
    }

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

// Helper functions
async function verifyWalletSignature(walletAddress: string, signature: string): Promise<boolean> {
  // Implementation for wallet signature verification
  // This would use ethers or similar to verify the signature
  return true // Placeholder
}

function shouldTriggerKYC(user: any): boolean {
  return user.totalTransactionVolume > 1000 || user.riskScore > 0.7
}

function shouldRequireMFA(user: any): boolean {
  return user.role === "merchant" && user.lastMFACheck < Date.now() - 24 * 60 * 60 * 1000
}
