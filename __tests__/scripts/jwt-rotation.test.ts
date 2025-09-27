import {
  getJWTSecrets,
  createRotationAwareToken,
  verifyRotationAwareToken,
  shouldRotateSecret,
  generateSecureSecret,
  JWTRotationService,
} from "@/lib/jwt-rotation"
import jest from "jest"

// Mock dependencies
jest.mock("jsonwebtoken")
jest.mock("@neondatabase/serverless")

const mockJwt = require("jsonwebtoken")
const mockNeon = require("@neondatabase/serverless")

describe("JWT Rotation System", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Reset environment variables
    process.env.JWT_SECRET = "current-test-secret"
    process.env.JWT_SECRET_PREVIOUS = "previous-test-secret"
    process.env.JWT_ROTATION_DATE = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  })

  describe("getJWTSecrets", () => {
    it("should return current and previous secrets", () => {
      const secrets = getJWTSecrets()

      expect(secrets.current).toBe("current-test-secret")
      expect(secrets.previous).toBe("previous-test-secret")
      expect(secrets.rotationDate).toBeInstanceOf(Date)
    })

    it("should throw error when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET

      expect(() => getJWTSecrets()).toThrow("JWT_SECRET environment variable is required")
    })

    it("should handle missing previous secret", () => {
      delete process.env.JWT_SECRET_PREVIOUS

      const secrets = getJWTSecrets()

      expect(secrets.current).toBe("current-test-secret")
      expect(secrets.previous).toBeUndefined()
    })
  })

  describe("createRotationAwareToken", () => {
    it("should create token with current secret", () => {
      const mockToken = "mock.jwt.token"
      mockJwt.sign.mockReturnValue(mockToken)

      const payload = { userId: "123", email: "test@example.com" }
      const token = createRotationAwareToken(payload)

      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          ...payload,
          secretVersion: "current",
          issuedAt: expect.any(String),
        }),
        "current-test-secret",
        { expiresIn: "7d" },
      )
      expect(token).toBe(mockToken)
    })

    it("should use custom expiration time", () => {
      const mockToken = "mock.jwt.token"
      mockJwt.sign.mockReturnValue(mockToken)

      const payload = { userId: "123" }
      createRotationAwareToken(payload, "1h")

      expect(mockJwt.sign).toHaveBeenCalledWith(expect.any(Object), "current-test-secret", { expiresIn: "1h" })
    })
  })

  describe("verifyRotationAwareToken", () => {
    it("should verify token with current secret", () => {
      const mockDecoded = { userId: "123", email: "test@example.com" }
      mockJwt.verify.mockReturnValue(mockDecoded)

      const result = verifyRotationAwareToken("test.token")

      expect(mockJwt.verify).toHaveBeenCalledWith("test.token", "current-test-secret")
      expect(result).toEqual({ ...mockDecoded, secretUsed: "current" })
    })

    it("should fallback to previous secret when current fails", () => {
      const mockDecoded = { userId: "123", email: "test@example.com" }
      mockJwt.verify
        .mockImplementationOnce(() => {
          throw new Error("Current secret failed")
        })
        .mockReturnValue(mockDecoded)

      const result = verifyRotationAwareToken("test.token")

      expect(mockJwt.verify).toHaveBeenCalledTimes(2)
      expect(mockJwt.verify).toHaveBeenNthCalledWith(1, "test.token", "current-test-secret")
      expect(mockJwt.verify).toHaveBeenNthCalledWith(2, "test.token", "previous-test-secret")
      expect(result).toEqual({
        ...mockDecoded,
        secretUsed: "previous",
        shouldRefresh: true,
      })
    })

    it("should throw error when both secrets fail", () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error("Verification failed")
      })

      expect(() => verifyRotationAwareToken("test.token")).toThrow("Invalid or expired token")
    })

    it("should throw original error when no previous secret exists", () => {
      delete process.env.JWT_SECRET_PREVIOUS
      const originalError = new Error("Current secret failed")
      mockJwt.verify.mockImplementation(() => {
        throw originalError
      })

      expect(() => verifyRotationAwareToken("test.token")).toThrow(originalError)
    })
  })

  describe("shouldRotateSecret", () => {
    it("should return true when rotation is needed (>90 days)", () => {
      // Set rotation date to 100 days ago
      process.env.JWT_ROTATION_DATE = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()

      expect(shouldRotateSecret()).toBe(true)
    })

    it("should return false when rotation is not needed (<90 days)", () => {
      // Set rotation date to 30 days ago
      process.env.JWT_ROTATION_DATE = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      expect(shouldRotateSecret()).toBe(false)
    })

    it("should return false when no rotation date is set", () => {
      delete process.env.JWT_ROTATION_DATE

      expect(shouldRotateSecret()).toBe(false)
    })
  })

  describe("generateSecureSecret", () => {
    it("should generate a base64 encoded secret", () => {
      const secret = generateSecureSecret()

      expect(typeof secret).toBe("string")
      expect(secret.length).toBeGreaterThan(0)
      // Should be valid base64
      expect(() => Buffer.from(secret, "base64")).not.toThrow()
    })

    it("should generate different secrets on each call", () => {
      const secret1 = generateSecureSecret()
      const secret2 = generateSecureSecret()

      expect(secret1).not.toBe(secret2)
    })
  })

  describe("JWTRotationService", () => {
    let service: JWTRotationService
    let mockSql: jest.Mock

    beforeEach(() => {
      mockSql = jest.fn()
      mockNeon.neon.mockReturnValue(mockSql)
      service = new JWTRotationService()
    })

    describe("getCurrentKeys", () => {
      it("should fetch active keys from database", async () => {
        const mockKeys = [
          { id: 1, secret: "key1", is_active: true, created_at: new Date() },
          { id: 2, secret: "key2", is_active: true, created_at: new Date() },
        ]
        mockSql.mockResolvedValue(mockKeys)

        const keys = await service.getCurrentKeys()

        expect(mockSql).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.stringContaining("SELECT * FROM jwt_keys"),
            expect.stringContaining("WHERE is_active = true"),
            expect.stringContaining("ORDER BY created_at DESC"),
          ]),
        )
        expect(keys).toEqual(mockKeys)
      })
    })

    describe("signToken", () => {
      it("should sign token with current key", async () => {
        const mockKeys = [{ secret: "current-key", created_at: new Date() }]
        mockSql.mockResolvedValue(mockKeys)
        mockJwt.sign.mockReturnValue("signed.token")

        const payload = { userId: "123" }
        const token = await service.signToken(payload)

        expect(mockJwt.sign).toHaveBeenCalledWith(payload, "current-key", { expiresIn: "7d" })
        expect(token).toBe("signed.token")
      })

      it("should throw error when no active keys found", async () => {
        mockSql.mockResolvedValue([])

        await expect(service.signToken({ userId: "123" })).rejects.toThrow("No active JWT keys found")
      })
    })

    describe("verifyToken", () => {
      it("should verify token with available keys", async () => {
        const mockKeys = [{ secret: "key1" }, { secret: "key2" }]
        mockSql.mockResolvedValue(mockKeys)
        const mockDecoded = { userId: "123" }
        mockJwt.verify
          .mockImplementationOnce(() => {
            throw new Error("Key1 failed")
          })
          .mockReturnValue(mockDecoded)

        const result = await service.verifyToken("test.token")

        expect(mockJwt.verify).toHaveBeenCalledTimes(2)
        expect(result).toEqual(mockDecoded)
      })

      it("should throw error when all keys fail", async () => {
        const mockKeys = [{ secret: "key1" }, { secret: "key2" }]
        mockSql.mockResolvedValue(mockKeys)
        mockJwt.verify.mockImplementation(() => {
          throw new Error("Verification failed")
        })

        await expect(service.verifyToken("test.token")).rejects.toThrow(
          "Token verification failed with all available keys",
        )
      })
    })

    describe("checkRotationStatus", () => {
      it("should recommend rotation when no keys exist", async () => {
        mockSql.mockResolvedValue([])

        const status = await service.checkRotationStatus()

        expect(status).toEqual({
          shouldRotate: true,
          reason: "No active keys found",
        })
      })

      it("should recommend rotation when key is old", async () => {
        const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
        const mockKeys = [{ created_at: oldDate }]
        mockSql.mockResolvedValue(mockKeys)

        const status = await service.checkRotationStatus()

        expect(status.shouldRotate).toBe(true)
        expect(status.daysSinceCreation).toBeGreaterThan(90)
        expect(status.reason).toBe("Key is older than 90 days")
      })

      it("should not recommend rotation when key is recent", async () => {
        const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        const mockKeys = [{ created_at: recentDate }]
        mockSql.mockResolvedValue(mockKeys)

        const status = await service.checkRotationStatus()

        expect(status.shouldRotate).toBe(false)
        expect(status.daysSinceCreation).toBeLessThan(90)
        expect(status.reason).toBe("Key is within rotation window")
      })
    })
  })
})
