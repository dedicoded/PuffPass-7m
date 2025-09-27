import { hashPassword, verifyPassword } from "@/lib/crypto-utils"

describe("Crypto Utils", () => {
  describe("hashPassword", () => {
    it("should create a valid bcrypt hash", async () => {
      const password = "TestPassword123!"
      const hash = await hashPassword(password)

      // Bcrypt hash should start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/)
      expect(hash).toHaveLength(60) // Standard bcrypt hash length
    })

    it("should create different hashes for same password", async () => {
      const password = "TestPassword123!"
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2) // Salt should make them different
    })

    it("should handle empty password", async () => {
      await expect(hashPassword("")).rejects.toThrow()
    })
  })

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "TestPassword123!"
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })

    it("should reject incorrect password", async () => {
      const password = "TestPassword123!"
      const wrongPassword = "WrongPassword456!"
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hash)

      expect(isValid).toBe(false)
    })

    it("should handle invalid hash format", async () => {
      const password = "TestPassword123!"
      const invalidHash = "not-a-valid-hash"

      await expect(verifyPassword(password, invalidHash)).rejects.toThrow()
    })
  })
})
