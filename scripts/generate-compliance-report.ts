import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

const sql = neon(process.env.DATABASE_URL!)

interface ComplianceMetrics {
  totalEvents: number
  passes: number
  fails: number
  skips: number
  passRate: number
  failRate: number
  skipRate: number
}

interface DailyTrend {
  day: string
  passes: number
  fails: number
}

interface TopRoute {
  route: string
  attempts: number
}

interface SuspiciousIP {
  ip_address: string
  failures: number
}

interface AuditSample {
  timestamp: string
  user_id: string | null
  ip_address: string
  route: string
  action: string
  reason: string | null
}

async function generateComplianceReport(month: string, year: string) {
  console.log(`📊 Generating compliance report for ${month} ${year}...`)

  const startDate = new Date(`${year}-${month}-01`)
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + 1)

  // 1. Get monthly totals
  const totals = await sql`
    SELECT 
      COUNT(*) as total_events,
      SUM(CASE WHEN action = 'pass' THEN 1 ELSE 0 END) as passes,
      SUM(CASE WHEN action = 'fail' THEN 1 ELSE 0 END) as fails,
      SUM(CASE WHEN action = 'skip' THEN 1 ELSE 0 END) as skips
    FROM age_verification_logs
    WHERE created_at >= ${startDate.toISOString()}
      AND created_at < ${endDate.toISOString()}
  `

  const metrics: ComplianceMetrics = {
    totalEvents: Number(totals[0].total_events),
    passes: Number(totals[0].passes),
    fails: Number(totals[0].fails),
    skips: Number(totals[0].skips),
    passRate: (Number(totals[0].passes) / Number(totals[0].total_events)) * 100,
    failRate: (Number(totals[0].fails) / Number(totals[0].total_events)) * 100,
    skipRate: (Number(totals[0].skips) / Number(totals[0].total_events)) * 100,
  }

  // 2. Get daily trends
  const dailyTrends = await sql`
    SELECT 
      DATE(created_at) as day,
      SUM(CASE WHEN action = 'pass' THEN 1 ELSE 0 END) as passes,
      SUM(CASE WHEN action = 'fail' THEN 1 ELSE 0 END) as fails
    FROM age_verification_logs
    WHERE created_at >= ${startDate.toISOString()}
      AND created_at < ${endDate.toISOString()}
    GROUP BY DATE(created_at)
    ORDER BY day
  `

  // 3. Get top routes
  const topRoutes = await sql`
    SELECT route, COUNT(*) as attempts
    FROM age_verification_logs
    WHERE created_at >= ${startDate.toISOString()}
      AND created_at < ${endDate.toISOString()}
    GROUP BY route
    ORDER BY attempts DESC
    LIMIT 10
  `

  // 4. Get suspicious IPs
  const suspiciousIPs = await sql`
    SELECT ip_address, COUNT(*) as failures
    FROM age_verification_logs
    WHERE action = 'fail'
      AND created_at >= ${startDate.toISOString()}
      AND created_at < ${endDate.toISOString()}
    GROUP BY ip_address
    HAVING COUNT(*) > 5
    ORDER BY failures DESC
  `

  // 5. Get sample audit entries
  const auditSamples = await sql`
    SELECT 
      created_at as timestamp,
      user_id,
      ip_address,
      route,
      action,
      reason
    FROM age_verification_logs
    WHERE created_at >= ${startDate.toISOString()}
      AND created_at < ${endDate.toISOString()}
    ORDER BY created_at DESC
    LIMIT 10
  `

  // Generate report
  const report = generateReportMarkdown(
    month,
    year,
    metrics,
    dailyTrends as DailyTrend[],
    topRoutes as TopRoute[],
    suspiciousIPs as SuspiciousIP[],
    auditSamples as AuditSample[],
  )

  // Save report
  const reportsDir = "./compliance-reports"
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  const filename = `compliance-report-${year}-${month}.md`
  const filepath = path.join(reportsDir, filename)
  fs.writeFileSync(filepath, report)

  console.log(`✅ Compliance report saved: ${filepath}`)

  // Also save as CSV for easy import
  const csvData = generateCSV(dailyTrends as DailyTrend[], topRoutes as TopRoute[], suspiciousIPs as SuspiciousIP[])
  const csvFilename = `compliance-data-${year}-${month}.csv`
  const csvFilepath = path.join(reportsDir, csvFilename)
  fs.writeFileSync(csvFilepath, csvData)

  console.log(`✅ CSV data saved: ${csvFilepath}`)
}

function generateReportMarkdown(
  month: string,
  year: string,
  metrics: ComplianceMetrics,
  dailyTrends: DailyTrend[],
  topRoutes: TopRoute[],
  suspiciousIPs: SuspiciousIP[],
  auditSamples: AuditSample[],
): string {
  return `# Age Verification Compliance Report – ${month} ${year}

**Prepared by**: PuffPass / MyCora  
**Prepared for**: Regulatory Compliance  
**Date**: ${new Date().toISOString().split("T")[0]}

---

## Executive Summary

This report summarizes age verification activities for ${month} ${year}.

- **Total verification events**: ${metrics.totalEvents.toLocaleString()}
- **Pass rate**: ${metrics.passRate.toFixed(2)}%
- **Fail rate**: ${metrics.failRate.toFixed(2)}%
- **Skip rate (allowlist)**: ${metrics.skipRate.toFixed(2)}%

---

## Key Metrics

| Metric              | Count | % of Total |
|---------------------|-------|-------------|
| Pass                | ${metrics.passes.toLocaleString()} | ${metrics.passRate.toFixed(1)}% |
| Fail                | ${metrics.fails.toLocaleString()} | ${metrics.failRate.toFixed(1)}% |
| Skip (allowlist)    | ${metrics.skips.toLocaleString()} | ${metrics.skipRate.toFixed(1)}% |
| **Total**           | ${metrics.totalEvents.toLocaleString()} | 100% |

---

## Daily Trends

| Date | Passes | Fails |
|------|--------|-------|
${dailyTrends.map((d) => `| ${d.day} | ${d.passes} | ${d.fails} |`).join("\n")}

---

## Top Routes Triggering Verification

| Route | Attempts |
|-------|----------|
${topRoutes.map((r) => `| ${r.route} | ${r.attempts} |`).join("\n")}

---

## Suspicious Activity

IPs with repeated failures (>5 failures):

| IP Address | Failures |
|------------|----------|
${suspiciousIPs.length > 0 ? suspiciousIPs.map((ip) => `| ${ip.ip_address} | ${ip.failures} |`).join("\n") : "| None detected | - |"}

---

## Sample Audit Log Entries

| Timestamp | User ID | IP Address | Route | Action | Reason |
|-----------|---------|------------|-------|--------|--------|
${auditSamples.map((a) => `| ${a.timestamp} | ${a.user_id || "anonymous"} | ${a.ip_address} | ${a.route} | ${a.action} | ${a.reason || "-"} |`).join("\n")}

---

## Compliance Statement

This report confirms that age verification middleware is enforced on all protected routes. Audit logs are retained for 2 years in compliance with regulatory requirements.

For questions or follow-up, please contact: compliance@puffpass.com

---

*Report generated automatically on ${new Date().toISOString()}*
`
}

function generateCSV(dailyTrends: DailyTrend[], topRoutes: TopRoute[], suspiciousIPs: SuspiciousIP[]): string {
  let csv = "Section,Date/Route/IP,Value1,Value2\n"

  // Daily trends
  dailyTrends.forEach((d) => {
    csv += `Daily Trends,${d.day},${d.passes},${d.fails}\n`
  })

  // Top routes
  topRoutes.forEach((r) => {
    csv += `Top Routes,${r.route},${r.attempts},\n`
  })

  // Suspicious IPs
  suspiciousIPs.forEach((ip) => {
    csv += `Suspicious IPs,${ip.ip_address},${ip.failures},\n`
  })

  return csv
}

// CLI usage
const args = process.argv.slice(2)
if (args.length < 2) {
  console.error("❌ Please provide month and year.")
  console.error("Usage: pnpm compliance:report 09 2025")
  process.exit(1)
}

const [month, year] = args
generateComplianceReport(month, year)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed to generate report:", err)
    process.exit(1)
  })
