export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs") // lazy import to avoid module load issues
  return bcrypt.hash(password, 10)
}

export async function verifyPasswordHash(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs") // lazy import to avoid module load issues
  return bcrypt.compare(password, hashedPassword)
}
