import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import type { User } from "./db"
import crypto from "crypto" // fixed crypto import to use Node.js built-in crypto module properly
let JWTRotationService: any = null
let jwtService: any = null

// Only import and initialize JWT rotation service in server environment
if (typeof window === "undefined") {
  try {
    const jwtRotationModule = require("./jwt-rotation")
    JWTRotationService = jwtRotationModule.JWTRotationService
    jwtService = new JWTRotationService()
  } catch (error) {
    console.warn("[v0] JWT rotation service not available, using fallback")
  }
}

const secretKey = process.env.STACK_SECRET_SERVER_KEY!
const key = new TextEncoder().encode(secretKey)

export async function createToken(payload: {
  userId: string
  email: string
  role: "customer" | "merchant" | "admin"
  age?: number
  sessionId?: string
  deviceFingerprint?: string
}): Promise<string> {
  try {
    console.log("[v0] Creating JWT token with payload:", {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })

    if (jwtService) {
      const token = await jwtService.signToken(payload)
      console.log("[v0] JWT token created successfully with rotation service")
      return token
    } else {
      console.log("[v0] Using fallback token creation (browser environment)")
    }
  } catch (error) {
    console.error("[v0] Error creating token:", error)
    console.log("[v0] Falling back to legacy token creation")
  }

  // Fallback to legacy token creation
  if (!secretKey) {
    throw new Error("STACK_SECRET_SERVER_KEY is not configured")
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.exp ? new Date(payload.exp * 1000).toISOString() : "7d")
    .sign(key)

  console.log("[v0] Legacy JWT token created successfully")
  return token
}

export async function verifyToken(token: string): Promise<{
  userId: string
  email: string
  role: "customer" | "merchant" | "admin"
  age?: number
  exp?: number
  iat?: number
  sessionId?: string
  deviceFingerprint?: string
}> {
  try {
    if (jwtService) {
      const rotationResult = await jwtService.verifyToken(token)
      console.log("[v0] Token verified using rotation service")
      return rotationResult
    }
  } catch (rotationError) {
    console.log("[v0] Rotation service verification failed, trying legacy method")
  }

  // Use legacy verification method
  try {
    const { payload } = await jwtVerify(token, key)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as "customer" | "merchant" | "admin",
      age: payload.age as number | undefined,
      exp: payload.exp as number | undefined,
      iat: payload.iat as number | undefined,
      sessionId: payload.sessionId as string | undefined,
      deviceFingerprint: payload.deviceFingerprint as string | undefined,
    }
  } catch (error) {
    console.error("[v0] Token verification failed:", error)
    throw error
  }
}

export async function verifyAdminWallet(walletAddress: string, signature: string): Promise<boolean> {
  try {
    const trustedWallets = process.env.TRUSTED_WALLETS?.split(",").map((addr) => addr.trim().toLowerCase()) || []

    if (!trustedWallets.includes(walletAddress.toLowerCase())) {
      console.log("[v0] Wallet not in trusted list:", walletAddress)
      return false
    }

    // For now, return true if wallet is in trusted list
    console.log("[v0] Trusted wallet verified:", walletAddress)
    return true
  } catch (error) {
    console.error("[v0] Admin wallet verification error:", error)
    return false
  }
}

export async function createSession(
  user: User,
  response?: NextResponse,
  options?: { duration?: string; auditLog?: boolean },
) {
  try {
    console.log("[v0] Creating enhanced session for user:", user.id)

    let maxAge: number
    switch (user.role) {
      case "admin":
        maxAge = options?.duration === "1h" ? 60 * 60 : 60 * 60 * 2 // 1-2 hours for admin
        break
      case "merchant":
        maxAge = 60 * 60 * 24 * 3 // 3 days for merchants
        break
      case "customer":
      default:
        maxAge = 60 * 60 * 24 * 7 // 7 days for consumers
        break
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: crypto.randomUUID(),
      deviceFingerprint: generateDeviceFingerprint(),
      exp: Math.floor(Date.now() / 1000) + maxAge,
    }

    if (options?.auditLog && user.role === "admin") {
      await logAdminSession(user.id, payload.sessionId)
    }

    const session = await createToken(payload)

    if (response) {
      response.cookies.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
      })

      if (user.role === "admin") {
        response.cookies.set("admin-session", session, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: maxAge,
        })
      }
    }

    console.log("[v0] Enhanced session created with duration:", maxAge)
  } catch (error) {
    console.error("[v0] Enhanced session creation error:", error)
    throw error
  }
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) return null

  try {
    if (jwtService) {
      const payload = await jwtService.verifyToken(session)
      return {
        id: payload.userId,
        email: payload.email,
        name: "", // Will be fetched from DB if needed
        role: payload.role,
        created_at: "",
        updated_at: "",
      }
    }
  } catch (error) {
    console.log("[v0] Rotation service verification failed, using legacy method")
  }

  // Use legacy verification
  try {
    const { payload } = await jwtVerify(session, key)
    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: "", // Will be fetched from DB if needed
      role: payload.role as "customer" | "merchant" | "admin",
      created_at: "",
      updated_at: "",
    }
  } catch (legacyError) {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  cookieStore.delete("admin-session")
}

export async function linkWalletToUser(userId: string, walletAddress: string): Promise<boolean> {
  try {
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(process.env.DATABASE_URL!)

    await sql`
      UPDATE users 
      SET wallet_address = ${walletAddress}, updated_at = NOW()
      WHERE id = ${userId}
    `

    console.log("[v0] Wallet linked to user:", { userId, walletAddress })
    return true
  } catch (error) {
    console.error("[v0] Error linking wallet to user:", error)
    return false
  }
}

// Helper functions
function generateDeviceFingerprint(): string {
  // Generate device fingerprint for session tracking
  return crypto.randomUUID()
}

async function logAdminSession(userId: string, sessionId: string) {
  // Log admin session for audit trail
  console.log("[AUDIT] Admin session created:", { userId, sessionId, timestamp: new Date().toISOString() })
}
