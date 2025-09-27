// This prevents crypto dependencies from breaking all API routes

export async function hashPassword(password: string): Promise<string> {
  console.log("[v0] hashPassword called with lazy-loaded bcryptjs")
  try {
    // Lazy import to prevent module loading issues
    const bcrypt = await import("bcryptjs")
    const hash = await bcrypt.default.hash(password, 10)
    console.log("[v0] Password hashed successfully with bcryptjs")
    return hash
  } catch (error) {
    console.error("[v0] Error in hashPassword:", error)
    throw error
  }
}

export async function verifyPasswordHash(password: string, hashedPassword: string): Promise<boolean> {
  console.log("[v0] verifyPasswordHash called with lazy-loaded bcryptjs")
  try {
    // Lazy import to prevent module loading issues
    const bcrypt = await import("bcryptjs")
    const isValid = await bcrypt.default.compare(password, hashedPassword)
    console.log("[v0] Password verification result:", isValid)
    return isValid
  } catch (error) {
    console.error("[v0] Error in verifyPasswordHash:", error)
    return false
  }
}

// Helper function that combines database lookup with password verification
export async function verifyUserPassword(email: string, password: string): Promise<any | null> {
  if (!email || typeof email !== "string" || email.trim() === "") {
    console.log("[v0] verifyUserPassword called with invalid email:", email)
    return null
  }

  if (!password || typeof password !== "string" || password.trim() === "") {
    console.log("[v0] verifyUserPassword called with invalid password")
    return null
  }

  try {
    console.log("[v0] Starting password verification for:", email.trim().toLowerCase())

    // Import database functions only when needed
    const { executeQuery } = await import("./db-with-circuit-breaker")
    const normalizedEmail = email.trim().toLowerCase()

    const result = await executeQuery`
      SELECT id, name, email, password, role, wallet_address, patient_certification, dc_residency, referral_code, created_at, updated_at
      FROM users 
      WHERE email = ${normalizedEmail}
    `

    if (result.length === 0) {
      console.log("[v0] No user found with email:", normalizedEmail)
      return null
    }

    const user = result[0]

    console.log("[v0] User found, verifying password with crypto")
    const isPasswordValid = await verifyPasswordHash(password, user.password)

    if (isPasswordValid) {
      console.log("[v0] Password verification successful")
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet_address: user.wallet_address,
        patient_certification: user.patient_certification,
        dc_residency: user.dc_residency,
        referral_code: user.referral_code,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    }

    console.log("[v0] Password verification failed")
    return null
  } catch (error) {
    console.error("[v0] Error in verifyUserPassword:", error)
    return null
  }
}
