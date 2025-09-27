import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import type { User } from "./db"

let JWTRotationService: any = null
let jwtService: any = null

// Only import and initialize JWT rotation service in server environment
if (typeof window === "undefined") {
  try {
    // Use dynamic import instead of require
    import("./jwt-rotation")
      .then((jwtRotationModule) => {
        JWTRotationService = jwtRotationModule.JWTRotationService
        jwtService = new JWTRotationService()
      })
      .catch((error) => {
        console.warn("[v0] JWT rotation service not available, using fallback")
      })
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
    .setExpirationTime("7d")
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
    }
  } catch (error) {
    console.error("[v0] Token verification failed:", error)
    throw error
  }
}

export async function createSession(user: User, response?: NextResponse) {
  try {
    console.log("[v0] Creating session for user:", user.id)

    if (jwtService) {
      const rotationStatus = await jwtService.checkRotationStatus()
      if (rotationStatus.shouldRotate) {
        console.warn("[COMPLIANCE] JWT secret rotation due - schedule maintenance")
      }
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    }

    console.log("[v0] Creating JWT with payload:", { userId: payload.userId, email: payload.email, role: payload.role })

    let session: string
    if (jwtService) {
      session = await jwtService.signToken(payload)
      console.log("[v0] JWT created successfully with rotation service")
    } else {
      session = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key)
      console.log("[v0] JWT created successfully with fallback method")
    }

    if (response) {
      response.cookies.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      if (user.role === "admin") {
        response.cookies.set("admin-token", session, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        })
        console.log("[v0] Admin token cookie set on response")
      }
    } else {
      const cookieStore = await cookies()
      cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      if (user.role === "admin") {
        cookieStore.set("admin-token", session, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        })
        console.log("[v0] Admin token cookie set")
      }
    }

    console.log("[v0] Session cookie set")
    console.log("[v0] Session creation completed")
  } catch (error) {
    console.error("[v0] Error in createSession:", error)
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
  cookieStore.delete("admin-token")
}
