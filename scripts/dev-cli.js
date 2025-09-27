import { execSync } from "child_process"
import fs from "fs"

// MyCora Development CLI Tool
// Provides project-specific development commands

const commands = {
  "check-env": () => {
    console.log("🔍 Checking environment configuration...")
    const publicVars = ["NEXT_PUBLIC_PUFF_PASS_CONTRACT", "NEXT_PUBLIC_CONTRACT_ADDRESS"]

    const missing = []
    publicVars.forEach((varName) => {
      if (!process.env[varName]) {
        missing.push(varName)
      }
    })

    if (missing.length > 0) {
      console.error("❌ Missing public environment variables:", missing.join(", "))
      console.log("💡 Add these variables in your Vercel Project Settings")
      process.exit(1)
    }

    console.log("✅ All required public environment variables are set")
    console.log("⚠️  Note: Sensitive variables (DATABASE_URL, etc.) are not checked for security")
  },

  "audit-git": () => {
    console.log("🔍 Running git audit...")
    try {
      const status = execSync("git status --porcelain", { encoding: "utf8" })
      if (status.trim()) {
        console.log("📝 Uncommitted changes found:")
        console.log(status)
      } else {
        console.log("✅ Working directory is clean")
      }
    } catch (error) {
      console.error("❌ Git audit failed:", error.message)
    }
  },

  "validate-build": () => {
    console.log("🔨 Validating build configuration...")
    try {
      // Check if critical files exist
      const criticalFiles = ["next.config.mjs", "lib/csp.js", "app/layout.tsx", "package.json"]

      criticalFiles.forEach((file) => {
        if (!fs.existsSync(file)) {
          throw new Error(`Critical file missing: ${file}`)
        }
      })

      console.log("✅ Build configuration is valid")
    } catch (error) {
      console.error("❌ Build validation failed:", error.message)
      process.exit(1)
    }
  },

  help: () => {
    console.log(`
MyCora Development CLI

Available commands:
  check-env      - Verify public environment variables only
  audit-git      - Check git status and uncommitted changes
  validate-build - Validate build configuration files
  help          - Show this help message

Usage: node scripts/dev-cli.js <command>

Note: Sensitive environment variables are not checked by this tool for security reasons.
    `)
  },
}

const command = process.argv[2]

if (!command || !commands[command]) {
  commands.help()
  process.exit(command ? 1 : 0)
}

commands[command]()
