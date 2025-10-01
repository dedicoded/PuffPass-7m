import crypto from "crypto"

/**
 * Verifies webhook signature using HMAC SHA-256
 * Uses constant-time comparison to prevent timing attacks
 */
export function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(rawBody, "utf8")
    const digest = hmac.digest("hex")

    // Compare in constant time to avoid timing attacks
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signature, "hex"))
  } catch (error) {
    console.error("[v0] Signature verification error:", error)
    return false
  }
}
