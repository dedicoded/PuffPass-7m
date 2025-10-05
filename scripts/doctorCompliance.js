#!/usr/bin/env node

import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

console.log("🏥 PuffPass Doctor - System Compliance Check\n")

const checks = [
  {
    name: "Database Connection",
    check: async () => {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL not set")
      }
      const sql = neon(process.env.DATABASE_URL)
      await sql`SELECT 1`
      return "Database connection successful"
    },
  },
  {
    name: "Environment Variables",
    check: async () => {
      const required = ["DATABASE_URL", "NEXT_PUBLIC_STACK_PROJECT_ID"]
      const missing = required.filter((key) => !process.env[key])
      if (missing.length > 0) {
        throw new Error(`Missing: ${missing.join(", ")}`)
      }
      return "All required environment variables present"
    },
  },
  {
    name: "Age Verification Middleware",
    check: async () => {
      const middlewarePath = path.join(process.cwd(), "middleware.ts")
      if (!fs.existsSync(middlewarePath)) {
        throw new Error("middleware.ts not found")
      }
      const content = fs.readFileSync(middlewarePath, "utf-8")
      if (!content.includes("ageVerificationMiddleware")) {
        throw new Error("Age verification middleware not configured")
      }
      return "Age verification middleware configured"
    },
  },
  {
    name: "Blockchain Configuration",
    check: async () => {
      const configPath = path.join(process.cwd(), "lib/blockchain-config.ts")
      if (!fs.existsSync(configPath)) {
        throw new Error("blockchain-config.ts not found")
      }
      return "Blockchain configuration present"
    },
  },
  {
    name: "Authentication Setup",
    check: async () => {
      const authPath = path.join(process.cwd(), "lib/auth-enhanced.ts")
      if (!fs.existsSync(authPath)) {
        throw new Error("auth-enhanced.ts not found")
      }
      return "Enhanced authentication configured"
    },
  },
  {
    name: "API Routes",
    check: async () => {
      const apiPath = path.join(process.cwd(), "app/api")
      if (!fs.existsSync(apiPath)) {
        throw new Error("API directory not found")
      }
      const routes = ["auth/login", "auth/register", "web3/health"]
      const missing = routes.filter((route) => !fs.existsSync(path.join(apiPath, route, "route.ts")))
      if (missing.length > 0) {
        throw new Error(`Missing routes: ${missing.join(", ")}`)
      }
      return "All critical API routes present"
    },
  },
  {
    name: "Security Headers",
    check: async () => {
      const nextConfigPath = path.join(process.cwd(), "next.config.mjs")
      if (!fs.existsSync(nextConfigPath)) {
        throw new Error("next.config.mjs not found")
      }
      const content = fs.readFileSync(nextConfigPath, "utf-8")
      if (!content.includes("Content-Security-Policy")) {
        console.warn("⚠️  CSP headers not configured")
      }
      return "Next.js configuration present"
    },
  },
]

async function runChecks() {
  let passed = 0
  let failed = 0

  for (const { name, check } of checks) {
    try {
      const result = await check()
      console.log(`✅ ${name}: ${result}`)
      passed++
    } catch (error) {
      console.error(`❌ ${name}: ${error.message}`)
      failed++
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)

  if (failed > 0) {
    console.log("\n⚠️  System has compliance issues that need attention")
    process.exit(1)
  } else {
    console.log("\n✨ All compliance checks passed!")
    process.exit(0)
  }
}

runChecks().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
