// Simplified NPX wrapper for MyCora development workflow
import { execSync } from "child_process"

// Simple npx wrapper that delegates to npm exec
// Handles basic argument transformation for compatibility

const args = process.argv.slice(2)

// Transform common npx arguments to npm exec equivalents
const transformedArgs = args.map((arg) => {
  if (arg === "--no-install") return "--yes=false"
  if (arg.startsWith("--package=") || arg.startsWith("-p=")) {
    return arg.replace(/^(-p=|--package=)/, "--package=")
  }
  return arg
})

try {
  // Execute npm exec with transformed arguments
  const command = `npm exec ${transformedArgs.join(" ")}`
  console.log(`🔧 Running: ${command}`)
  execSync(command, { stdio: "inherit" })
} catch (error) {
  console.error("❌ NPX wrapper failed:", error.message)
  process.exit(1)
}
