// Temporary compatibility layer - uses lazy loading to avoid module load issues
export async function hashPassword(password: string): Promise<string> {
  const { hashPassword: hashPasswordImpl } = await import("./auth-utils")
  return hashPasswordImpl(password)
}

export async function verifyPasswordHash(password: string, hashedPassword: string): Promise<boolean> {
  const { verifyPasswordHash: verifyPasswordHashImpl } = await import("./auth-utils")
  return verifyPasswordHashImpl(password, hashedPassword)
}
