import bcrypt from "bcryptjs"

export async function hashPasswordIsolated(password: string): Promise<string> {
  console.log("[v0] hashPasswordIsolated called - using local bcryptjs only")
  try {
    // Use bcryptjs directly with no other imports
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    console.log("[v0] Password hashed successfully with isolated bcryptjs")
    return hash
  } catch (error) {
    console.error("[v0] Error in hashPasswordIsolated:", error)
    throw new Error(`Password hashing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function verifyPasswordIsolated(password: string, hashedPassword: string): Promise<boolean> {
  console.log("[v0] verifyPasswordIsolated called - using local bcryptjs only")
  try {
    const isValid = await bcrypt.compare(password, hashedPassword)
    console.log("[v0] Password verification result:", isValid)
    return isValid
  } catch (error) {
    console.error("[v0] Error in verifyPasswordIsolated:", error)
    return false
  }
}
