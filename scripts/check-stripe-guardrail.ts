#!/usr/bin/env tsx

/**
 * Stripe Guardrail Check
 *
 * Ensures no Stripe code exists in the codebase.
 * PuffPass is crypto-native only (Cybrid + Sphere).
 *
 * This script fails the build if any Stripe references are found.
 */

import { readFileSync, existsSync } from "fs"
import { execSync } from "child_process"
import path from "path"

interface StripeViolation {
  type: "dependency" | "import" | "file" | "env" | "workflow"
  location: string
  details: string
}

class StripeGuardrail {
  private violations: StripeViolation[] = []
  private readonly projectRoot: string

  constructor() {
    this.projectRoot = process.cwd()
  }

  /**
   * Check package.json for Stripe dependencies
   */
  private checkPackageJson(): void {
    const packageJsonPath = path.join(this.projectRoot, "package.json")

    if (!existsSync(packageJsonPath)) {
      console.warn("⚠️  package.json not found")
      return
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
    }

    // Check for Stripe packages
    const stripePackages = Object.keys(allDeps).filter((pkg) => pkg.includes("stripe") || pkg.startsWith("@stripe/"))

    stripePackages.forEach((pkg) => {
      this.violations.push({
        type: "dependency",
        location: "package.json",
        details: `Found Stripe dependency: ${pkg}@${allDeps[pkg]}`,
      })
    })
  }

  /**
   * Check for Stripe imports in source code
   */
  private checkImports(): void {
    try {
      const grepResult = execSync(
        `grep -r "from ['\"]stripe['\"]\\|import.*stripe\\|require.*stripe" app/ components/ lib/ scripts/ src/ pages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true`,
        { encoding: "utf8" },
      )

      if (grepResult.trim()) {
        const lines = grepResult.trim().split("\n")
        lines.forEach((line) => {
          const [file, ...content] = line.split(":")
          this.violations.push({
            type: "import",
            location: file,
            details: `Stripe import found: ${content.join(":").trim()}`,
          })
        })
      }
    } catch (error) {
      console.warn("⚠️  Could not check imports:", error)
    }
  }

  /**
   * Check for Stripe API routes or files
   */
  private checkStripeFiles(): void {
    try {
      const findResult = execSync(
        `find app/ components/ lib/ src/ pages/ -name "*stripe*" -type f 2>/dev/null || true`,
        {
          encoding: "utf8",
        },
      )

      if (findResult.trim()) {
        const files = findResult.trim().split("\n")
        files.forEach((file) => {
          this.violations.push({
            type: "file",
            location: file,
            details: `Stripe-related file exists`,
          })
        })
      }
    } catch (error) {
      console.warn("⚠️  Could not check files:", error)
    }
  }

  /**
   * Check for Stripe environment variables
   */
  private checkEnvironmentVars(): void {
    try {
      // Check for Stripe env vars in various config files
      const envFiles = [".env", ".env.local", ".env.example", "vercel.json"]

      envFiles.forEach((envFile) => {
        const envPath = path.join(this.projectRoot, envFile)
        if (existsSync(envPath)) {
          const content = readFileSync(envPath, "utf8")
          const stripeVars = content.split("\n").filter((line) => line.includes("STRIPE_") && !line.startsWith("#"))

          stripeVars.forEach((varLine) => {
            this.violations.push({
              type: "env",
              location: envFile,
              details: `Stripe environment variable: ${varLine.trim()}`,
            })
          })
        }
      })
    } catch (error) {
      console.warn("⚠️  Could not check environment variables:", error)
    }
  }

  /**
   * Check GitHub workflows for Stripe references
   */
  private checkWorkflows(): void {
    try {
      const workflowDir = path.join(this.projectRoot, ".github/workflows")
      if (existsSync(workflowDir)) {
        const grepResult = execSync(
          `grep -r "stripe" .github/workflows/ --include="*.yml" --include="*.yaml" 2>/dev/null || true`,
          { encoding: "utf8" },
        )

        if (grepResult.trim()) {
          const lines = grepResult.trim().split("\n")
          lines.forEach((line) => {
            const [file, ...content] = line.split(":")
            // Skip our own guardrail workflow
            if (!file.includes("stripe-guardrail")) {
              this.violations.push({
                type: "workflow",
                location: file,
                details: `Stripe reference in workflow: ${content.join(":").trim()}`,
              })
            }
          })
        }
      }
    } catch (error) {
      console.warn("⚠️  Could not check workflows:", error)
    }
  }

  /**
   * Run all checks
   */
  public async runChecks(): Promise<boolean> {
    console.log("🔍 Running Enhanced Stripe Guardrail Checks...\n")

    this.checkPackageJson()
    this.checkImports()
    this.checkStripeFiles()
    this.checkEnvironmentVars()
    this.checkWorkflows() // Added workflow checking

    if (this.violations.length === 0) {
      console.log("✅ PASS: No Stripe code detected")
      console.log("🚀 PuffPass remains crypto-native only (Cybrid + Sphere)\n")
      return true
    }

    // Report violations
    console.log("❌ FAIL: Stripe code detected in codebase!\n")
    console.log("🚨 PuffPass must remain crypto-native only (Cybrid + Sphere)\n")

    const groupedViolations = this.violations.reduce(
      (acc, violation) => {
        if (!acc[violation.type]) acc[violation.type] = []
        acc[violation.type].push(violation)
        return acc
      },
      {} as Record<string, StripeViolation[]>,
    )

    Object.entries(groupedViolations).forEach(([type, violations]) => {
      console.log(`📋 ${type.toUpperCase()} VIOLATIONS:`)
      violations.forEach((violation) => {
        console.log(`   • ${violation.location}: ${violation.details}`)
      })
      console.log("")
    })

    console.log("🧹 CLEANUP REQUIRED:")
    console.log("   1. Remove Stripe dependencies: npm uninstall stripe @stripe/stripe-js @stripe/react-stripe-js")
    console.log("   2. Delete Stripe API routes: rm -rf app/api/stripe/")
    console.log("   3. Remove Stripe imports from source files")
    console.log("   4. Clean up Stripe environment variables")
    console.log("   5. Remove Stripe references from GitHub workflows")
    console.log("   6. Verify only Cybrid + Sphere payment processing remains\n")

    return false
  }
}

// Run the guardrail check
async function main() {
  const guardrail = new StripeGuardrail()
  const passed = await guardrail.runChecks()

  if (!passed) {
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Stripe guardrail check failed:", error)
    process.exit(1)
  })
}

export { StripeGuardrail }
