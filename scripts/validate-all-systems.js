const { execSync } = require("child_process")

console.log("🚀 Starting comprehensive system validation...\n")

const steps = [
  {
    name: "Database Connection",
    script: "scripts/test-database-connection.js",
    description: "Testing Neon database connectivity and schema",
  },
  {
    name: "Authentication System",
    script: "scripts/test-minimal-auth.js",
    description: "Testing bcryptjs password hashing and auth flow",
  },
  {
    name: "Environment Variables",
    script: "scripts/server-env-check.js",
    description: "Validating required environment variables",
  },
]

async function runStep(step, index) {
  console.log(`\n📋 Step ${index + 1}/${steps.length}: ${step.name}`)
  console.log(`📝 ${step.description}`)
  console.log("─".repeat(50))

  try {
    execSync(`node ${step.script}`, {
      stdio: "inherit",
      cwd: process.cwd(),
    })
    console.log(`✅ ${step.name} - PASSED`)
    return true
  } catch (error) {
    console.error(`❌ ${step.name} - FAILED`)
    console.error(`Error: ${error.message}`)
    return false
  }
}

async function validateAllSystems() {
  const startTime = Date.now()
  let passedSteps = 0

  console.log("🔍 System Validation Report")
  console.log("═".repeat(50))

  for (let i = 0; i < steps.length; i++) {
    const success = await runStep(steps[i], i)
    if (success) {
      passedSteps++
    } else {
      console.log("\n🛑 Validation stopped due to failure")
      break
    }
  }

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  console.log("\n" + "═".repeat(50))
  console.log("📊 VALIDATION SUMMARY")
  console.log("═".repeat(50))
  console.log(`✅ Passed: ${passedSteps}/${steps.length} steps`)
  console.log(`⏱️  Duration: ${duration} seconds`)
  console.log(`📅 Completed: ${new Date().toISOString()}`)

  if (process.env.USERNAME) {
    console.log(`👤 Validated by: ${process.env.USERNAME}`)
  }

  if (passedSteps === steps.length) {
    console.log("\n🎉 ALL SYSTEMS VALIDATED SUCCESSFULLY!")
    console.log("🚀 Your application is ready for deployment")
    return true
  } else {
    console.log("\n❌ VALIDATION FAILED")
    console.log("🔧 Please fix the failing components before deployment")
    return false
  }
}

// Run validation
validateAllSystems()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error("❌ Unexpected validation error:", error)
    process.exit(1)
  })
