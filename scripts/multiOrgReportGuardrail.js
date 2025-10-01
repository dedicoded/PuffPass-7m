#!/usr/bin/env node
import fs from "fs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

// Define your organizations and recipients
const ORGS = [
  { name: "DC_Dispensary_A", email: "joekpoehtrust@proton.me" },
  { name: "DC_Dispensary_B", email: "compliance-b@partner.org" },
  // Add more as you scale
]

async function generateOrgReport(orgName) {
  const month = new Date().toISOString().slice(0, 7)
  const reportDir = "./reports"
  fs.mkdirSync(reportDir, { recursive: true })
  const filename = `${reportDir}/${orgName}_compliance-${month}.csv`

  try {
    // Check if logs table exists
    const exists = await sql`
      SELECT to_regclass('age_verification_logs') AS table_name;
    `

    if (!exists[0]?.table_name) {
      fs.writeFileSync(filename, "note\nage_verification_logs table missing — no data available this month\n")
      return filename
    }

    // Query scoped to this org (assuming organization column exists)
    const results = await sql`
      SELECT DATE(created_at) AS day,
             COUNT(*) AS total,
             SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS passes,
             SUM(CASE WHEN NOT verified THEN 1 ELSE 0 END) AS fails
      FROM age_verification_logs
      WHERE organization = ${orgName}
        AND created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
        AND created_at < date_trunc('month', CURRENT_DATE)
      GROUP BY day
      ORDER BY day;
    `

    const header = "day,total,passes,fails\n"
    const rows = results.map((r) => `${r.day},${r.total},${r.passes},${r.fails}`).join("\n")

    fs.writeFileSync(filename, header + rows)
    return filename
  } catch (err) {
    console.error(`❌ Report generation failed for ${orgName}:`, err.message)
    fs.writeFileSync(filename, `note\nError: ${err.message}\n`)
    return filename
  }
}

async function sendReport(org, filepath) {
  // Email integration would go here
  // For now, just log the action
  console.log(`📧 Report for ${org.name} ready to send to ${org.email}: ${filepath}`)

  // Uncomment when SendGrid is configured:
  // const fileContent = fs.readFileSync(filepath).toString("base64");
  // const month = new Date().toISOString().slice(0, 7);
  //
  // await sgMail.send({
  //   to: org.email,
  //   from: "compliance@puffpass.io",
  //   subject: `PuffPass Compliance Report – ${org.name} – ${month}`,
  //   text: `Attached is the monthly compliance report for ${org.name}.`,
  //   attachments: [{
  //     content: fileContent,
  //     filename: filepath.split("/").pop(),
  //     type: "text/csv",
  //     disposition: "attachment"
  //   }]
  // });
}

async function run() {
  console.log("🚀 Starting multi-org compliance report generation...")

  for (const org of ORGS) {
    console.log(`\n📊 Processing ${org.name}...`)
    const filepath = await generateOrgReport(org.name)
    await sendReport(org, filepath)
  }

  console.log("\n✅ All org reports generated successfully!")
}

run().catch((err) => {
  console.error("❌ Multi-org compliance pipeline failed:", err.message)
  process.exit(1)
})
