// Generate a new JWT secret for manual rotation
// Use this when you need a new cryptographically secure secret

import { generateSecureSecret } from "../lib/jwt-rotation"

function generateNewSecret() {
  console.log("🔐 Generating new JWT secret...")

  const newSecret = generateSecureSecret()

  console.log("✅ New JWT secret generated:")
  console.log(`JWT_SECRET=${newSecret}`)
  console.log("")
  console.log("🔧 To rotate:")
  console.log("1. Set JWT_SECRET_PREVIOUS to your current JWT_SECRET")
  console.log("2. Set JWT_SECRET to the new value above")
  console.log("3. Set JWT_ROTATION_DATE to current date")
  console.log("4. Deploy and test")
}

// Run if called directly
if (require.main === module) {
  generateNewSecret()
}

export { generateNewSecret }
