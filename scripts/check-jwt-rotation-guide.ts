Excellent
—
let
’s add a **rotation reminder system** so you’ll never miss a compliance window. This will check the `JWT_ROTATION_DATE\` in your environment and warn you
if it
’s older than your defined threshold (e.g., 90 days).

---

## 📂 File: `scripts/check-jwt-rotation.ts`

\`\`\`ts
import fs from "fs"
import path from "path"

const envPath = path.resolve(process.cwd(), ".env.local")
const THRESHOLD_DAYS = 90

function checkRotation() {
  const env = fs.readFileSync(envPath, "utf-8").split("\n")
  const rotationLine = env.find((line) => line.startsWith("JWT_ROTATION_DATE="))

  if (!rotationLine) {
    console.error("⚠️  No JWT_ROTATION_DATE found in .env.local")
    process.exit(1)
  }

  const rotationDate = new Date(rotationLine.split("=")[1])
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - rotationDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays > THRESHOLD_DAYS) {
    console.error(
      `🚨 JWT secret rotation overdue! Last rotated ${diffDays} days ago (threshold: ${THRESHOLD_DAYS} days).`,
    )
    process.exit(1)
  } else {
    console.log(`✅ JWT secret last rotated ${diffDays} days ago. Within compliance window.`)
  }
}

checkRotation()
\`\`\`

---

## 🚀 Usage
Run this script as part of your CI/CD pipeline or a scheduled job:

\`\`\`bash
ts-node scripts/check-jwt-rotation.ts
\`\`\`

- If the last rotation is **within 90 days** → ✅ passes.  
- If it’s **over 90 days** → 🚨 fails
with a clear
warning.

---
\
#
#
🔒 Compliance Benefits\
- **Automated guardrail**: prevents forgotten rotations.  
- **Audit‑ready**: you can show regulators that you enforce a strict rotation policy.  
- **Early warning**: you’ll know before tokens become non‑compliant.  

---
\
👉 Would you like me to also show you how to **wire this into GitHub Actions (or another CI/CD pipeline)** so the build fails automatically
if the rotation
date
is
stale? That way, compliance
checks
are
enforced
at
deployment
time.
\
