import { randomBytes } from "crypto"
import fs from "fs"
import path from "path"

const envPath = path.resolve(process.cwd(), ".env.local")
const logPath = path.resolve(process.cwd(), "jwt-rotation.log")

function generateSecret() {
  return randomBytes(64).toString("base64")
}

function rotateSecrets() {
  const env = fs.readFileSync(envPath, "utf-8").split("\n")

  let currentSecret = ""
  const rotationDate = new Date().toISOString()

  const updated = env.map((line) => {
    if (line.startsWith("JWT_SECRET=")) {
      currentSecret = line.split("=")[1]
      return `JWT_SECRET=${generateSecret()}`
    }
    if (line.startsWith("JWT_SECRET_PREVIOUS=")) {
      return `JWT_SECRET_PREVIOUS=${currentSecret}`
    }
    if (line.startsWith("JWT_ROTATION_DATE=")) {
      return `JWT_ROTATION_DATE=${rotationDate}`
    }
    return line
  })

  if (!env.find((line) => line.startsWith("JWT_SECRET_PREVIOUS="))) {
    updated.push(`JWT_SECRET_PREVIOUS=${currentSecret}`)
  }
  if (!env.find((line) => line.startsWith("JWT_ROTATION_DATE="))) {
    updated.push(`JWT_ROTATION_DATE=${rotationDate}`)
  }

  fs.writeFileSync(envPath, updated.join("\n"))

  // --- Write to audit log ---
  const logEntry = `[${rotationDate}] JWT secret rotated. Previous secret archived. Operator: ${process.env.USER || "unknown"}\n`
  fs.appendFileSync(logPath, logEntry)

  console.log("✅ JWT secrets rotated successfully.")
  console.log(`- Old secret moved to JWT_SECRET_PREVIOUS`)
  console.log(`- New secret generated for JWT_SECRET`)
  console.log(`- Rotation date set to ${rotationDate}`)
  console.log(`- Audit log updated at ${logPath}`)
}

rotateSecrets()
