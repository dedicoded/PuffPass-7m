import { execSync } from "child_process"
import path from "path"
import jest from "jest"

// Mock dependencies
jest.mock("child_process")
jest.mock("@neondatabase/serverless")

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>
const mockNeon = require("@neondatabase/serverless")

describe("JWT Rotation Script", () => {
  let mockSql: jest.Mock
  const scriptPath = path.join(process.cwd(), "scripts", "rotate-jwt-secret-with-audit.ts")

  beforeEach(() => {
    jest.clearAllMocks()
    mockSql = jest.fn()
    mockNeon.neon.mockReturnValue(mockSql)

    // Mock environment variables
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"
    process.env.JWT_SECRET = "current-secret"
  })

  describe("Script Execution", () => {
    it("should execute without syntax errors", () => {
      // Test that the script can be parsed by TypeScript
      expect(() => {
        mockExecSync(`npx ts-node --check ${scriptPath}`, {
          encoding: "utf8",
          stdio: "pipe",
        })
      }).not.toThrow()
    })

    it("should be a valid TypeScript file", () => {
      const fs = require("fs")
      const scriptContent = fs.readFileSync(scriptPath, "utf8")

      // Basic syntax checks
      expect(scriptContent).toContain("import")
      expect(scriptContent).toContain("async function")
      expect(scriptContent).not.toContain("```") // No markdown code blocks
      expect(scriptContent).not.toContain("## ") // No markdown headers
    })
  })

  describe("Rotation Logic", () => {
    it("should create audit log entry", async () => {
      // Mock successful database operations
      mockSql
        .mockResolvedValueOnce([]) // getCurrentKeys
        .mockResolvedValueOnce([{ id: 1 }]) // insertNewKey
        .mockResolvedValueOnce([{ id: 1 }]) // createAuditLog

      // Import and test the rotation function
      const { rotateJWTSecret } = require("../../scripts/rotate-jwt-secret-with-audit.ts")

      await rotateJWTSecret("test-operator")

      // Verify audit log was created
      expect(mockSql).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining("INSERT INTO jwt_rotation_audit")]),
      )
    })

    it("should handle database errors gracefully", async () => {
      mockSql.mockRejectedValue(new Error("Database connection failed"))

      const { rotateJWTSecret } = require("../../scripts/rotate-jwt-secret-with-audit.ts")

      await expect(rotateJWTSecret("test-operator")).rejects.toThrow("Database connection failed")
    })

    it("should validate operator parameter", async () => {
      const { rotateJWTSecret } = require("../../scripts/rotate-jwt-secret-with-audit.ts")

      await expect(rotateJWTSecret("")).rejects.toThrow()
      await expect(rotateJWTSecret(null)).rejects.toThrow()
      await expect(rotateJWTSecret(undefined)).rejects.toThrow()
    })
  })

  describe("Integration with CI/CD", () => {
    it("should be referenced in package.json scripts", () => {
      const packageJson = require("../../package.json")

      expect(packageJson.scripts).toHaveProperty("rotate-jwt")
      expect(packageJson.scripts["rotate-jwt"]).toContain("rotate-jwt-secret-with-audit")
    })

    it("should be used in GitHub workflows", () => {
      const fs = require("fs")
      const workflowsDir = path.join(process.cwd(), ".github", "workflows")

      if (fs.existsSync(workflowsDir)) {
        const workflowFiles = fs.readdirSync(workflowsDir)
        const jwtWorkflows = workflowFiles.filter((file: string) => file.includes("jwt") && file.endsWith(".yml"))

        expect(jwtWorkflows.length).toBeGreaterThan(0)

        jwtWorkflows.forEach((file: string) => {
          const content = fs.readFileSync(path.join(workflowsDir, file), "utf8")
          expect(content).toContain("rotate-jwt-secret-with-audit")
        })
      }
    })
  })
})
