#!/usr/bin/env node
import fs from "fs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

/**
 * Generate a compliance report safely with email delivery:
 * 1. Check if the logs table exists
 * 2. If missing, emit a placeholder report
 * 3. If present, query and export results
 * 4. Email the report to compliance inbox
 */
async function generateSafeReport() {
  const reportDir = "./reports"
  fs.mkdirSync(reportDir, { recursive: true })

  const month = new Date().toISOString().slice(0, 7)
  const filename = `${reportDir}/compliance-${month}.csv`

  try {
    // 1. Check if table exists
    const exists = await sql`
      SELECT to_regclass('age_verification_logs') AS table_name;
    `

    if (!exists[0]?.table_name) {
      console.warn("⚠️ age_verification_logs table not found. Emitting placeholder report.")
      fs.writeFileSync(filename, "note\nage_verification_logs table missing — no data available this month\n")
      return filename
    }

    // 2. Query data
    const results = await sql`
      SELECT DATE(created_at) AS day,
             COUNT(*) AS total,
             SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS passes,
             SUM(CASE WHEN NOT verified THEN 1 ELSE 0 END) AS fails
      FROM age_verification_logs
      WHERE created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
        AND created_at < date_trunc('month', CURRENT_DATE)
      GROUP BY day
      ORDER BY day;
    `

    // 3. Write CSV
    const header = "day,total,passes,fails\n"
    const rows = results.map((r) => `${r.day},${r.total},${r.passes},${r.fails}`).join("\n")

    fs.writeFileSync(filename, header + rows)
    console.log(`✅ Compliance report generated: ${filename}`)
    return filename
  } catch (err) {
    console.error("❌ Report generation failed:", err.message)
    fs.writeFileSync(filename, `note\nReport generation error: ${err.message}\n`)
    return filename
  }
}

// For email integration, you would add SendGrid here:
// import sgMail from "@sendgrid/mail";
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//
// async function sendReport(filepath) {
//   const fileContent = fs.readFileSync(filepath).toString("base64");
//   const month = new Date().toISOString().slice(0, 7);
//
//   await sgMail.send({
//     to: "joekpoehtrust@proton.me",
//     from: "compliance@puffpass.io",
//     subject: `PuffPass Compliance Report – ${month}`,
//     text: "Attached is the monthly compliance report.",
//     attachments: [{
//       content: fileContent,
//       filename: filepath.split("/").pop(),
//       type: "text/csv",
//       disposition: "attachment"
//     }]
//   });
// }

generateSafeReport()
  .then((filepath) => {
    console.log(`📧 Report ready for email: ${filepath}`)
    // Uncomment to enable email: return sendReport(filepath);
  })
  .catch((err) => {
    console.error("Pipeline failed:", err)
    process.exit(1)
  })
