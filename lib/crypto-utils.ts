import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  console.log("[v0] hashPassword called with bcryptjs")
  try {
    const hash = await bcrypt.hash(password, 10)
    console.log("[v0] Password hashed successfully with bcryptjs")
    return hash
  } catch (error) {
    console.error("[v0] Error in hashPassword:", error)
    throw error
  }
}

export async function verifyPasswordHash(password: string, hashedPassword: string): Promise<boolean> {
  console.log("[v0] verifyPasswordHash called with bcryptjs")
  try {
    const isValid = await bcrypt.compare(password, hashedPassword)
    console.log("[v0] Password verification result:", isValid)
    return isValid
  } catch (error) {
    console.error("[v0] Error in verifyPasswordHash:", error)
    return false
  }
}
