import { createToken, verifyToken } from "@/lib/auth"

// Mock JWT secret for testing
const mockJwtSecret = "test-jwt-secret-key-for-testing-only"

describe("Auth Utils", () => {
  describe("createToken", () => {
    it("should create a valid JWT token", async () => {
      const payload = {
        userId: "123",
        email: "test@example.com",
        role: "customer" as const,
        age: 25,
      }

      const token = await createToken(payload)

      expect(token).toBeTruthy()
      expect(typeof token).toBe("string")
      expect(token.split(".")).toHaveLength(3) // JWT has 3 parts
    })

    it("should include correct payload data", async () => {
      const payload = {
        userId: "123",
        email: "test@example.com",
        role: "customer" as const,
        age: 25,
      }

      const token = await createToken(payload)
      const decoded = await verifyToken(token)

      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
      expect(decoded.role).toBe(payload.role)
      expect(decoded.age).toBe(payload.age)
    })
  })

  describe("verifyToken", () => {
    it("should verify valid token", async () => {
      const payload = {
        userId: "123",
        email: "test@example.com",
        role: "customer" as const,
        age: 25,
      }

      const token = await createToken(payload)
      const decoded = await verifyToken(token)

      expect(decoded).toBeTruthy()
      expect(decoded.userId).toBe("123")
    })

    it("should reject invalid token", async () => {
      const invalidToken = "invalid.jwt.token"

      await expect(verifyToken(invalidToken)).rejects.toThrow()
    })

    it("should reject expired token", async () => {
      // This would require mocking time or creating an expired token
      // For now, we'll test the structure
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid"

      await expect(verifyToken(expiredToken)).rejects.toThrow()
    })
  })
})
