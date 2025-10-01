import fs from "fs"
import { neon } from "@neondatabase/serverless"

async function generateReport() {
  const sql = neon(process.env.DATABASE_URL)

  // Get last month's date range
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const year = lastMonth.getFullYear()
  const month = String(lastMonth.getMonth() + 1).padStart(2, "0")

  console.log(`📊 Generating compliance report for ${year}-${month}...`)

  // Query age verification logs for last month
  const results = await sql`
    SELECT 
      DATE(created_at) AS day,
      COUNT(*) AS total,
      SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS passes,
      SUM(CASE WHEN NOT verified THEN 1 ELSE 0 END) AS fails,
      ROUND(100.0 * SUM(CASE WHEN verified THEN 1 ELSE 0 END) / COUNT(*), 2) AS pass_rate
    FROM age_verification_logs
    WHERE created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
      AND created_at < date_trunc('month', CURRENT_DATE)
    GROUP BY DATE(created_at)
    ORDER BY day;
  `

  // Get summary statistics
  const summary = await sql`
    SELECT 
      COUNT(*) AS total_verifications,
      SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS total_passes,
      SUM(CASE WHEN NOT verified THEN 1 ELSE 0 END) AS total_fails,
      ROUND(100.0 * SUM(CASE WHEN verified THEN 1 ELSE 0 END) / COUNT(*), 2) AS overall_pass_rate,
      COUNT(DISTINCT ip_address) AS unique_ips,
      COUNT(DISTINCT user_id) AS unique_users
    FROM age_verification_logs
    WHERE created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
      AND created_at < date_trunc('month', CURRENT_DATE);
  `

  // Create reports directory
  fs.mkdirSync("reports", { recursive: true })

  // Generate CSV report
  const csvHeader = "day,total,passes,fails,pass_rate\n"
  const csvRows = results.map((r) => `${r.day},${r.total},${r.passes},${r.fails},${r.pass_rate}%`).join("\n")

  const csvFilename = `reports/compliance-${year}-${month}.csv`
  fs.writeFileSync(csvFilename, csvHeader + csvRows)
  console.log(`✅ CSV report generated: ${csvFilename}`)

  // Generate summary report
  const summaryContent = `
Age Verification Compliance Report
Period: ${year}-${month}
Generated: ${new Date().toISOString()}

SUMMARY STATISTICS
==================
Total Verifications: ${summary[0].total_verifications}
Total Passes: ${summary[0].total_passes}
Total Fails: ${summary[0].total_fails}
Overall Pass Rate: ${summary[0].overall_pass_rate}%
Unique IP Addresses: ${summary[0].unique_ips}
Unique Users: ${summary[0].unique_users}

DAILY BREAKDOWN
===============
${results
  .map((r) => `${r.day}: ${r.total} total (${r.passes} passes, ${r.fails} fails) - ${r.pass_rate}% pass rate`)
  .join("\n")}
`

  const summaryFilename = `reports/compliance-summary-${year}-${month}.txt`
  fs.writeFileSync(summaryFilename, summaryContent)
  console.log(`✅ Summary report generated: ${summaryFilename}`)

  return { csvFilename, summaryFilename }
}

generateReport().catch((err) => {
  console.error("❌ Failed to generate compliance report:", err.message)
  process.exit(1)
})
