// JWT Secret Rotation System for Compliance-Grade Security
// Supports graceful rotation without breaking existing sessions

import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

interface JWTSecrets {
  current: string
  previous?: string
  rotationDate?: Date
}

/**
 * Get JWT secrets with rotation support
 * Supports both current and previous secrets for graceful transitions
 */
export function getJWTSecrets(): JWTSecrets {
  const current = process.env.JWT_SECRET
  const previous = process.env.JWT_SECRET_PREVIOUS
  const rotationDateStr = process.env.JWT_ROTATION_DATE

  if (!current) {
    throw new Error("JWT_SECRET environment variable is required")
  }

  return {
    current,
    previous,
    rotationDate: rotationDateStr ? new Date(rotationDateStr) : undefined,
  }
}

/**
 * Create JWT with current secret
 */
export function createRotationAwareToken(payload: any, expiresIn = "7d"): string {
  const { current } = getJWTSecrets()

  return jwt.sign(
    {
      ...payload,
      // Add rotation metadata for tracking
      secretVersion: "current",
      issuedAt: new Date().toISOString(),
    },
    current,
    { expiresIn },
  )
}

/**
 * Verify JWT with fallback to previous secret
 * Allows graceful rotation without breaking existing sessions
 */
export function verifyRotationAwareToken(token: string): any {
  const { current, previous } = getJWTSecrets()

  try {
    // Try current secret first
    const decoded = jwt.verify(token, current)
    console.log("[v0] Token verified with current secret")
    return { ...decoded, secretUsed: "current" }
  } catch (currentError) {
    if (previous) {
      try {
        // Fallback to previous secret
        const decoded = jwt.verify(token, previous)
        console.log("[v0] Token verified with previous secret - consider refresh")
        return { ...decoded, secretUsed: "previous", shouldRefresh: true }
      } catch (previousError) {
        console.log("[v0] Token verification failed with both secrets")
        throw new Error("Invalid or expired token")
      }
    } else {
      console.log("[v0] Token verification failed, no previous secret available")
      throw currentError
    }
  }
}

/**
 * Check if JWT rotation is needed based on age
 */
export function shouldRotateSecret(): boolean {
  const { rotationDate } = getJWTSecrets()

  if (!rotationDate) return false

  const daysSinceRotation = (Date.now() - rotationDate.getTime()) / (1000 * 60 * 60 * 24)

  // Rotate every 90 days for compliance
  return daysSinceRotation >= 90
}

/**
 * Generate a cryptographically secure JWT secret
 */
export async function generateSecureSecret(): Promise<string> {
  if (typeof window !== "undefined") {
    // Browser environment - use Web Crypto API
    const array = new Uint8Array(64)
    window.crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  } else {
    // Node.js environment - use crypto module
    const cryptoModule = await import("crypto")
    return cryptoModule.randomBytes(64).toString("base64")
  }
}

export class JWTRotationService {
  private sql: any

  constructor() {
    this.sql = neon(process.env.DATABASE_URL!)
  }

  async getCurrentKeys() {
    const result = await this.sql`
      SELECT * FROM jwt_keys 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `
    return result
  }

  async signToken(payload: any, expiresIn = "7d"): Promise<string> {
    const keys = await this.getCurrentKeys()

    if (keys.length === 0) {
      throw new Error("No active JWT keys found")
    }

    const currentKey = keys[0]
    return jwt.sign(payload, currentKey.secret, { expiresIn })
  }

  async verifyToken(token: string): Promise<any> {
    const keys = await this.getCurrentKeys()

    for (const key of keys) {
      try {
        const decoded = jwt.verify(token, key.secret)
        return decoded
      } catch (error) {
        continue
      }
    }

    throw new Error("Token verification failed with all available keys")
  }

  async checkRotationStatus() {
    const keys = await this.getCurrentKeys()

    if (keys.length === 0) {
      return { shouldRotate: true, reason: "No active keys found" }
    }

    const latestKey = keys[0]
    const daysSinceCreation = (Date.now() - new Date(latestKey.created_at).getTime()) / (1000 * 60 * 60 * 24)

    return {
      shouldRotate: daysSinceCreation >= 90,
      daysSinceCreation,
      reason: daysSinceCreation >= 90 ? "Key is older than 90 days" : "Key is within rotation window",
    }
  }
}
