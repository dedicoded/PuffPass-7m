// Server-side environment variable checker for MyCora/PuffPass
// This script should only be run in secure server environments

console.log("🔒 Checking sensitive environment variables (server-side only)...")

const sensitiveVars = ["DATABASE_URL", "WALLETCONNECT_PROJECT_ID", "NEXTAUTH_SECRET", "NEXTAUTH_URL"]

const missing = []
sensitiveVars.forEach((varName) => {
  if (!process.env[varName]) {
    missing.push(varName)
  }
})

if (missing.length > 0) {
  console.error("❌ Missing sensitive environment variables:", missing.join(", "))
  console.log("💡 Add these variables in your Vercel Project Settings under Environment Variables")
  process.exit(1)
}

console.log("✅ All required sensitive environment variables are set")
