# PuffPass Compliance Setup Guide

Complete guide for setting up and maintaining PuffPass's compliance infrastructure for age verification audit logging and regulatory reporting.

---

## 🚀 Quick Start

### Pre-Flight Check (Recommended First Step)
\`\`\`bash
pnpm diagnose:compliance
\`\`\`

Run this BEFORE setup to catch common issues:
- Schema drift (wrong table names)
- Missing environment variables
- Database connection problems
- Inconsistent script targets

This diagnostic tool will tell you exactly what needs to be fixed before you run setup.

### One-Liner Setup
\`\`\`bash
pnpm setup:compliance
\`\`\`

This single command applies all migrations in the correct order:
1. Foundation tables (providers, age verification logs)
2. Organization column (multi-org support)
3. Compliance views (summary, suspicious IPs)

### Verify Setup
\`\`\`bash
pnpm verify:compliance
\`\`\`

Checks that all tables, columns, views, and indexes are properly configured.

### Smoke Test (End-to-End Verification)
\`\`\`bash
pnpm test:compliance
\`\`\`

Runs a complete end-to-end test that:
1. Inserts a fake verification event
2. Confirms it lands in \`age_verification_logs\`
3. Verifies it appears in \`org_compliance_summary\` view
4. Tests suspicious IP detection in \`org_suspicious_ips\` view
5. Cleans up test data

This proves your entire compliance system is wired correctly in seconds.

### Contributor Onboarding (Health Check)
\`\`\`bash
pnpm doctor:compliance
\`\`\`

New contributors should run this command to verify their local environment is properly configured:
- Checks all required environment variables are set
- Verifies database connection
- Confirms all required tables and views exist
- Validates compliance scripts are present

This is the first command new team members should run before working on compliance features.

---

## 📋 What Gets Created

### Tables
- **`providers_lookup`** - Registry of age verification providers (Persona, Onfido, etc.)
- **`age_verification_logs`** - Audit log for all age verification events

### Columns
- **`organization`** - Added to \`age_verification_logs\` for multi-tenant reporting

### Views
- **`org_compliance_summary`** - Daily pass/fail rates per organization
- **`org_suspicious_ips`** - IP addresses with repeated failures (fraud detection)

### Indexes
- \`idx_age_verification_logs_created_at\` - Fast date range queries
- \`idx_age_verification_logs_action\` - Filter by action type
- \`idx_age_verification_logs_ip\` - IP-based fraud detection
- \`idx_age_verification_logs_org\` - Multi-org queries

---

## 🛡️ Manual Setup (Step-by-Step)

If you prefer to apply migrations manually or need to troubleshoot:

### Phase 1: Foundation Tables
\`\`\`bash
# 1. Providers lookup table
pnpm migrate:v0safe "CREATE TABLE providers_lookup (...);" add-providers-lookup

# 2. Age verification logs table
pnpm migrate:v0safe "CREATE TABLE age_verification_logs (...);" create-age-verification-logs
\`\`\`

### Phase 2: Multi-Org Support
\`\`\`bash
# 3. Add organization column
pnpm migrate:v0safe "ALTER TABLE age_verification_logs ADD COLUMN IF NOT EXISTS organization TEXT;" add-org-column
\`\`\`

### Phase 3: Compliance Views
\`\`\`bash
# 4. Create compliance views
node scripts/13-create-age-verification-views.sql
\`\`\`

---

## 📊 Generating Reports

### Single-Org Report (with Email)
\`\`\`bash
pnpm compliance:monthly
\`\`\`

Generates a CSV report and emails it to \`joekpoehtrust@proton.me\`.

### Multi-Org Reports
\`\`\`bash
pnpm compliance:multi-org
\`\`\`

Generates separate CSV reports for each organization and emails them to their compliance contacts.

### Manual Report Generation
\`\`\`sql
-- Daily compliance summary
SELECT * FROM org_compliance_summary 
WHERE day >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY organization, day DESC;

-- Suspicious IPs
SELECT * FROM org_suspicious_ips
WHERE failures > 10;
\`\`\`

---

## 🔍 Monitoring & Dashboards

### Admin Dashboard
Visit \`/admin\` and navigate to the **Age Verification** tab to view:
- Real-time pass/fail rates
- Daily and hourly trends
- Top routes triggering verification
- Suspicious IP addresses
- Recent verification events

### Export Data
Click the **Export CSV** button in the admin dashboard to download compliance data for regulators.

---

## 🚨 Troubleshooting

### "Table does not exist" Error
\`\`\`bash
# Run setup to create missing tables
pnpm setup:compliance
\`\`\`

### "Column does not exist" Error
\`\`\`bash
# Verify all columns are present
pnpm verify:compliance

# If organization column is missing, add it manually
pnpm migrate:v0safe "ALTER TABLE age_verification_logs ADD COLUMN IF NOT EXISTS organization TEXT;" add-org-column
\`\`\`

### "View does not exist" Error
\`\`\`bash
# Recreate views
node scripts/15-create-compliance-views.sql
\`\`\`

### Email Not Sending
1. Check that \`SENDGRID_API_KEY\` is set in environment variables
2. Verify the API key has "Mail Send" permissions in SendGrid
3. Check SendGrid dashboard for delivery logs

---

## 🔄 CI/CD Integration

### GitHub Actions

#### Compliance Test on Every Deploy
The \`.github/workflows/compliance-test.yml\` workflow automatically:
- Runs \`pnpm test:compliance\` on every push to main/staging
- Runs on every pull request
- Comments PR with test results
- Uploads test artifacts for 30 days
- Blocks deployment if compliance test fails

This ensures compliance is enforced at the pipeline level, not just locally.

#### Monthly Compliance Reports
The \`.github/workflows/monthly-compliance-report.yml\` workflow automatically:
- Generates monthly compliance reports on the 1st of each month at 9 AM UTC
- Emails reports to compliance contacts
- Stores reports as GitHub artifacts for 365 days
- Creates a GitHub issue if report generation fails

### Vercel Build Hook
The build process automatically validates all migrations before deployment:
\`\`\`bash
pnpm build  # Runs migrate:validate first
\`\`\`

---

## 📝 Best Practices

### Always Use v0-Safe Wrapper
\`\`\`bash
# ✅ Good - idempotent and safe
pnpm migrate:v0safe "CREATE TABLE ..." table-name

# ❌ Bad - might fail on re-run
psql -c "CREATE TABLE ..."
\`\`\`

### Test Migrations Locally First
\`\`\`bash
# 1. Apply migration locally
pnpm migrate:v0safe "ALTER TABLE ..." migration-name

# 2. Verify it worked
pnpm verify:compliance

# 3. Push to production
git push
\`\`\`

### Keep Migrations Idempotent
Always use:
- \`CREATE TABLE IF NOT EXISTS\`
- \`CREATE OR REPLACE VIEW\`
- \`ALTER TABLE ... ADD COLUMN IF NOT EXISTS\`

### Monitor Compliance Regularly
- Check admin dashboard weekly
- Generate monthly reports for regulators
- Review suspicious IPs for fraud patterns

---

## 🔗 Related Documentation

- [Migration Guardrails](./migration-guardrails.md) - Safe migration practices
- [v0-Safe Workflow](./v0-safe-workflow.md) - Using the v0-safe wrapper
- [Deployment Safety](./deployment-safety.md) - Build-time validation

---

## 📞 Support

If you encounter issues:
1. Run \`pnpm verify:compliance\` to diagnose
2. Check the troubleshooting section above
3. Review migration logs in \`migrations/\` folder
4. Contact support with error messages and logs
