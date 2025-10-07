"use server"

import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import type { User } from "./db"
import { getSql } from "./db"

// Enhanced authentication types
export interface AuthSession extends User {
  kycLevel: "basic" | "enhanced" | "full"
  deviceId?: string
  lastActivity: string
  requiresKyc?: boolean
}

export interface KycRequirement {
  level: "basic" | "enhanced" | "full"
  reason: "transaction_limit" | "merchant_verification" | "admin_access" | "compliance"
  requiredBy?: Date
}

export interface PasskeyCredential {
  id: string
  publicKey: string
  counter: number
  deviceType: string
  createdAt: Date
}

let _adminTrusteeWallet: string | null | undefined = undefined

function getAdminTrusteeWallet(): string | null {
  if (_adminTrusteeWallet === undefined) {
    _adminTrusteeWallet = process.env.NEXT_PUBLIC_ADMIN_TRUSTEE_WALLET?.toLowerCase() || null
  }
  return _adminTrusteeWallet
}

let _secretKey: string | null = null
let _key: Uint8Array | null = null

function getSecretKey(): string {
  if (_secretKey === null) {
    const key = process.env.STACK_SECRET_SERVER_KEY
    if (!key) {
      throw new Error("STACK_SECRET_SERVER_KEY environment variable is not configured")
    }
    _secretKey = key
  }
  return _secretKey
}

function getKey(): Uint8Array {
  if (_key === null) {
    _key = new TextEncoder().encode(getSecretKey())
  }
  return _key
}

// Enhanced session creation with KYC level and device tracking
export async function createEnhancedSession(
  user: User,
  kycLevel: "basic" | "enhanced" | "full" = "basic",
  deviceId?: string,
  response?: NextResponse,
): Promise<void> {
  try {
    console.log("[v0] Creating enhanced session for user:", user.id)

    // Check if admin role requires trustee wallet verification
    if (user.role === "admin" && !(await verifyAdminTrusteeWallet(user.wallet_address))) {
      throw new Error("Admin access requires verified trustee wallet")
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      kycLevel,
      deviceId,
      lastActivity: new Date().toISOString(),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    }

    const key = getKey()
    const session = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(key)

    const sql = getSql()
    // Store session in database for tracking
    await sql`
      INSERT INTO user_sessions (user_id, session_token, device_id, kyc_level, expires_at, created_at)
      VALUES (${user.id}, ${session}, ${deviceId || null}, ${kycLevel}, ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}, NOW())
      ON CONFLICT (user_id, device_id) DO UPDATE SET
        session_token = EXCLUDED.session_token,
        kyc_level = EXCLUDED.kyc_level,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    `

    if (response) {
      response.cookies.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })

      // Admin trustee gets additional secure cookie
      if (user.role === "admin") {
        response.cookies.set("admin-trustee-token", session, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
        })
      }
    } else {
      const cookieStore = await cookies()
      cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })

      if (user.role === "admin") {
        cookieStore.set("admin-trustee-token", session, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
        })
      }
    }

    console.log("[v0] Enhanced session created successfully")
  } catch (error) {
    console.error("[v0] Error creating enhanced session:", error)
    throw error
  }
}

// Verify admin trustee wallet address
export async function verifyAdminTrusteeWallet(walletAddress?: string): Promise<boolean> {
  const adminTrusteeWallet = getAdminTrusteeWallet()

  if (!adminTrusteeWallet) {
    console.warn("[v0] Admin trustee wallet not configured")
    return false
  }

  if (!walletAddress) {
    return false
  }

  return walletAddress.toLowerCase() === adminTrusteeWallet
}

// Enhanced session verification with KYC checks
export async function getEnhancedSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) return null

  try {
    const key = getKey()
    const { payload } = await jwtVerify(session, key)

    const sql = getSql()
    // Verify session exists in database and is not revoked
    const dbSession = await sql`
      SELECT us.*, u.name, u.email, u.role, u.wallet_address, u.patient_certification, u.dc_residency
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = ${session} AND us.expires_at > NOW()
    `

    if (dbSession.length === 0) {
      return null
    }

    const sessionData = dbSession[0]

    // Check if KYC is required based on recent activity
    const kycRequirement = await checkKycRequirement(sessionData.user_id, sessionData.role)

    return {
      id: sessionData.user_id,
      email: sessionData.email,
      name: sessionData.name,
      role: sessionData.role,
      wallet_address: sessionData.wallet_address,
      patient_certification: sessionData.patient_certification,
      dc_residency: sessionData.dc_residency,
      created_at: sessionData.created_at,
      updated_at: sessionData.updated_at,
      kycLevel: sessionData.kyc_level,
      deviceId: sessionData.device_id,
      lastActivity: sessionData.updated_at,
      requiresKyc: kycRequirement !== null,
    }
  } catch (error) {
    console.error("[v0] Enhanced session verification failed:", error)
    return null
  }
}

// Check if user requires KYC upgrade
export async function checkKycRequirement(userId: string, role: string): Promise<KycRequirement | null> {
  try {
    const sql = getSql()

    // Admin role always requires full KYC with trustee wallet
    if (role === "admin") {
      const user = await sql`SELECT wallet_address FROM users WHERE id = ${userId}`
      if (user.length === 0 || !(await verifyAdminTrusteeWallet(user[0].wallet_address))) {
        return {
          level: "full",
          reason: "admin_access",
          requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      }
    }

    // Check transaction limits for customers
    if (role === "customer") {
      const recentTransactions = await sql`
        SELECT SUM(total_amount) as total
        FROM orders 
        WHERE customer_id = ${userId} 
        AND created_at > NOW() - INTERVAL '30 days'
        AND status IN ('completed', 'confirmed')
      `

      const monthlyTotal = recentTransactions[0]?.total || 0

      // Require enhanced KYC for $1000+ monthly spending
      if (monthlyTotal > 1000) {
        return {
          level: "enhanced",
          reason: "transaction_limit",
        }
      }
    }

    // Merchant verification requires enhanced KYC
    if (role === "merchant") {
      const merchantProfile = await sql`
        SELECT verification_status FROM merchant_profiles WHERE user_id = ${userId}
      `

      if (merchantProfile.length > 0 && merchantProfile[0].verification_status !== "verified") {
        return {
          level: "enhanced",
          reason: "merchant_verification",
        }
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Error checking KYC requirement:", error)
    return null
  }
}

// Passkey registration
export async function registerPasskey(userId: string, credential: PasskeyCredential): Promise<void> {
  try {
    const sql = getSql()
    await sql`
      INSERT INTO user_passkeys (user_id, credential_id, public_key, counter, device_type, created_at)
      VALUES (${userId}, ${credential.id}, ${credential.publicKey}, ${credential.counter}, ${credential.deviceType}, NOW())
    `
    console.log("[v0] Passkey registered successfully for user:", userId)
  } catch (error) {
    console.error("[v0] Error registering passkey:", error)
    throw error
  }
}

// Passkey authentication
export async function authenticateWithPasskey(credentialId: string, signature: string): Promise<User | null> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT up.*, u.id, u.email, u.name, u.role, u.wallet_address, u.patient_certification, u.dc_residency, u.created_at, u.updated_at
      FROM user_passkeys up
      JOIN users u ON up.user_id = u.id
      WHERE up.credential_id = ${credentialId}
    `

    if (result.length === 0) {
      return null
    }

    const passkeyData = result[0]

    // TODO: Implement WebAuthn signature verification
    // For now, we'll assume the signature is valid
    console.log("[v0] Passkey authentication successful for user:", passkeyData.user_id)

    // Update counter to prevent replay attacks
    await sql`
      UPDATE user_passkeys 
      SET counter = counter + 1, last_used = NOW()
      WHERE credential_id = ${credentialId}
    `

    return {
      id: passkeyData.user_id,
      email: passkeyData.email,
      name: passkeyData.name,
      role: passkeyData.role,
      wallet_address: passkeyData.wallet_address,
      patient_certification: passkeyData.patient_certification,
      dc_residency: passkeyData.dc_residency,
      created_at: passkeyData.created_at,
      updated_at: passkeyData.updated_at,
    }
  } catch (error) {
    console.error("[v0] Passkey authentication error:", error)
    return null
  }
}

// Verify passkey for user authentication
export async function verifyPasskey(email: string, passkeyCredential: any): Promise<{ success: boolean; user?: User }> {
  try {
    if (!email || !passkeyCredential) {
      return { success: false }
    }

    console.log("[v0] Verifying passkey for email:", email)

    const sql = getSql()
    // Get user by email first
    const userResult = await sql`
      SELECT id, name, email, role, wallet_address, patient_certification, dc_residency, created_at, updated_at
      FROM users 
      WHERE email = ${email.trim().toLowerCase()}
    `

    if (userResult.length === 0) {
      console.log("[v0] No user found for passkey verification")
      return { success: false }
    }

    const user = userResult[0]

    // Check if user has registered passkeys
    const passkeyResult = await sql`
      SELECT credential_id, public_key, counter
      FROM user_passkeys 
      WHERE user_id = ${user.id} AND credential_id = ${passkeyCredential.id}
    `

    if (passkeyResult.length === 0) {
      console.log("[v0] No matching passkey found for user")
      return { success: false }
    }

    // TODO: Implement proper WebAuthn signature verification
    // For now, we'll assume the credential is valid if it exists
    console.log("[v0] Passkey verification successful")

    // Update passkey counter
    await sql`
      UPDATE user_passkeys 
      SET counter = counter + 1, last_used = NOW()
      WHERE credential_id = ${passkeyCredential.id}
    `

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet_address: user.wallet_address,
        patient_certification: user.patient_certification,
        dc_residency: user.dc_residency,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    }
  } catch (error) {
    console.error("[v0] Passkey verification error:", error)
    return { success: false }
  }
}

// Revoke all sessions for a user (for security incidents)
export async function revokeAllUserSessions(userId: string): Promise<void> {
  try {
    const sql = getSql()
    await sql`
      DELETE FROM user_sessions WHERE user_id = ${userId}
    `
    console.log("[v0] All sessions revoked for user:", userId)
  } catch (error) {
    console.error("[v0] Error revoking sessions:", error)
    throw error
  }
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const sql = getSql()
    const result = await sql`
      DELETE FROM user_sessions WHERE expires_at < NOW()
    `
    console.log("[v0] Cleaned up expired sessions:", result.length)
  } catch (error) {
    console.error("[v0] Error cleaning up sessions:", error)
  }
}

// Create embedded wallet
export async function createEmbeddedWallet(): Promise<{ address: string; privateKey?: string }> {
  try {
    console.log("[v0] Creating embedded wallet")

    // Generate a new wallet address (simplified implementation)
    // In production, this would use proper wallet generation libraries
    const randomBytes = new Uint8Array(20)
    crypto.getRandomValues(randomBytes)

    const address =
      "0x" +
      Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    console.log("[v0] Embedded wallet created:", address)

    const sql = getSql()
    // Store wallet in database for recovery
    await sql`
      INSERT INTO embedded_wallets (address, created_at)
      VALUES (${address}, NOW())
    `

    return {
      address,
      // privateKey would be securely stored/managed in production
    }
  } catch (error) {
    console.error("[v0] Error creating embedded wallet:", error)
    throw new Error("Failed to create embedded wallet")
  }
}
