import fs from "fs"
import path from "path"

describe("JWT Rotation Integration", () => {
  describe("Package.json Script Integration", () => {
    it("should have rotate-jwt script that calls the audit script", () => {
      const packageJsonPath = path.join(process.cwd(), "package.json")
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

      // Ensure the rotate-jwt script exists
      expect(packageJson.scripts).toHaveProperty("rotate-jwt")

      // Ensure it calls the correct audit script
      expect(packageJson.scripts["rotate-jwt"]).toContain("rotate-jwt-secret-with-audit")

      // Ensure it uses tsx for TypeScript execution
      expect(packageJson.scripts["rotate-jwt"]).toContain("tsx")
    })

    it("should have all required JWT-related scripts", () => {
      const packageJsonPath = path.join(process.cwd(), "package.json")
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

      const requiredScripts = ["rotate-jwt", "check-jwt", "verify-jwt"]

      requiredScripts.forEach((script) => {
        expect(packageJson.scripts).toHaveProperty(script)
      })
    })
  })

  describe("GitHub Workflows Integration", () => {
    it("should have JWT rotation workflows that reference the audit script", () => {
      const workflowsDir = path.join(process.cwd(), ".github", "workflows")

      // Ensure workflows directory exists
      expect(fs.existsSync(workflowsDir)).toBe(true)

      const workflowFiles = fs.readdirSync(workflowsDir)
      const jwtWorkflows = workflowFiles.filter((file: string) => file.includes("jwt") && file.endsWith(".yml"))

      // Ensure at least one JWT workflow exists
      expect(jwtWorkflows.length).toBeGreaterThan(0)

      // Check each JWT workflow references the audit script
      jwtWorkflows.forEach((file: string) => {
        const content = fs.readFileSync(path.join(workflowsDir, file), "utf8")
        expect(content).toContain("rotate-jwt-secret-with-audit")
      })
    })

    it("should have emergency and manual rotation workflows", () => {
      const workflowsDir = path.join(process.cwd(), ".github", "workflows")
      const workflowFiles = fs.readdirSync(workflowsDir)

      const expectedWorkflows = ["jwt-emergency-rotation.yml", "jwt-manual-rotation.yml"]

      expectedWorkflows.forEach((workflow) => {
        expect(workflowFiles).toContain(workflow)

        // Verify the workflow file contains the rotation script
        const content = fs.readFileSync(path.join(workflowsDir, workflow), "utf8")
        expect(content).toContain("npm run rotate-jwt")
      })
    })

    it("should ensure rotation happens before deployment in workflows", () => {
      const workflowsDir = path.join(process.cwd(), ".github", "workflows")
      const workflowFiles = fs.readdirSync(workflowsDir)

      const jwtWorkflows = workflowFiles.filter((file: string) => file.includes("jwt") && file.endsWith(".yml"))

      jwtWorkflows.forEach((file: string) => {
        const content = fs.readFileSync(path.join(workflowsDir, file), "utf8")

        // Parse YAML-like structure to ensure rotation step comes before deploy
        const lines = content.split("\n")
        let rotationStepIndex = -1
        let deployStepIndex = -1

        lines.forEach((line, index) => {
          if (line.includes("rotate-jwt") || line.includes("JWT rotation")) {
            rotationStepIndex = index
          }
          if (line.includes("deploy") || line.includes("Deploy")) {
            deployStepIndex = index
          }
        })

        // If both steps exist, rotation should come before deployment
        if (rotationStepIndex !== -1 && deployStepIndex !== -1) {
          expect(rotationStepIndex).toBeLessThan(deployStepIndex)
        }
      })
    })
  })

  describe("Script File Integrity", () => {
    it("should ensure the rotation script file exists and is executable", () => {
      const scriptPath = path.join(process.cwd(), "scripts", "rotate-jwt-secret-with-audit.ts")

      // File should exist
      expect(fs.existsSync(scriptPath)).toBe(true)

      // File should be readable
      const content = fs.readFileSync(scriptPath, "utf8")
      expect(content.length).toBeGreaterThan(0)

      // Should contain key functions
      expect(content).toContain("rotateJWTSecret")
      expect(content).toContain("auditLog")
    })

    it("should validate script dependencies are available", () => {
      const packageJsonPath = path.join(process.cwd(), "package.json")
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

      const requiredDeps = [
        "jose", // JWT handling
        "jsonwebtoken", // JWT verification
        "tsx", // TypeScript execution
      ]

      requiredDeps.forEach((dep) => {
        const hasInDeps = packageJson.dependencies && packageJson.dependencies[dep]
        const hasInDevDeps = packageJson.devDependencies && packageJson.devDependencies[dep]

        expect(hasInDeps || hasInDevDeps).toBeTruthy()
      })
    })
  })
})
