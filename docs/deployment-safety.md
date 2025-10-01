# Deployment Safety & Compliance Automation

This document explains the automated safety and compliance systems in place for PuffPass.

## 🛡️ Build-Time Migration Validation

Every deployment automatically validates all SQL migrations before building the app.

### How It Works

1. **Pre-Build Check**: The `build` script runs `migrate:validate` before `next build`
2. **Validation Process**: `scripts/validateMigrations.js` checks all `.sql` files for:
   - Empty files
   - Dangerous operations (DELETE/UPDATE without WHERE clause)
   - SQL syntax errors
3. **Fail-Safe**: If any migration fails validation, the build stops immediately

### Usage

\`\`\`bash
# Validate migrations manually
pnpm migrate:validate

# Build with automatic validation
pnpm build
\`\`\`

### Vercel Configuration

Your Vercel project is configured to run `pnpm build`, which automatically includes migration validation. No additional setup needed!

---

## 📊 Automated Compliance Reporting

Monthly compliance reports are generated automatically via GitHub Actions.

### What Gets Generated

1. **CSV Report**: Daily breakdown of age verification metrics
   - Total verifications per day
   - Pass/fail counts
   - Pass rate percentages

2. **Summary Report**: High-level statistics
   - Total verifications for the month
   - Overall pass rate
   - Unique IPs and users
   - Daily breakdown in text format

### Schedule

- **Automatic**: Runs at 2 AM UTC on the 1st of every month
- **Manual**: Can be triggered anytime from GitHub Actions UI

### Where to Find Reports

1. **GitHub Actions Artifacts**: Download from the workflow run
2. **GitHub Issues**: A summary is automatically posted as an issue
3. **Local Generation**: Run `pnpm compliance:report` anytime

### Manual Report Generation

\`\`\`bash
# Generate report for last month
pnpm compliance:report

# Reports are saved to ./reports/ directory
ls reports/
# compliance-2025-01.csv
# compliance-summary-2025-01.txt
\`\`\`

---

## 🔐 Security Features

### Migration Guardrails

- **Syntax Validation**: Catches SQL errors before deployment
- **Dangerous Operation Detection**: Warns about DELETE/UPDATE without WHERE
- **Dry-Run Testing**: Uses EXPLAIN to validate queries without executing

### Compliance Tracking

- **Audit Trail**: Every age verification is logged with timestamp, IP, user, route
- **Retention**: Reports stored for 90 days in GitHub Actions
- **Transparency**: Summary posted as GitHub issue for team visibility

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflows

1. **Migration Guardrail** (`.github/workflows/migration-guardrail.yml`)
   - Validates migrations on every PR
   - Prevents merging broken migrations

2. **Compliance Report** (`.github/workflows/compliance-report.yml`)
   - Generates monthly reports automatically
   - Creates GitHub issue with summary
   - Stores artifacts for 90 days

### Vercel Integration

- **Build Command**: `pnpm build` (includes migration validation)
- **Environment Variables**: Automatically configured via Neon integration
- **Deploy Protection**: Failed validation = failed deploy

---

## 📋 Checklist for Regulators

When auditors request compliance documentation, provide:

1. **Monthly CSV Reports**: Download from GitHub Actions artifacts
2. **Summary Statistics**: Available in GitHub issues or reports directory
3. **Audit Log Access**: Direct database access to `age_verification_logs` table
4. **System Documentation**: This file + `migration-guardrails.md`

---

## 🔧 Troubleshooting

### Build Fails with Migration Error

1. Check the error message in Vercel logs
2. Run `pnpm migrate:validate` locally to see the issue
3. Fix the problematic SQL file
4. Commit and redeploy

### Compliance Report Not Generated

1. Check GitHub Actions workflow status
2. Verify `DATABASE_URL` secret is set in GitHub
3. Ensure `age_verification_logs` table exists
4. Run `pnpm compliance:report` locally to debug

### Missing Reports

1. Check GitHub Actions artifacts (90-day retention)
2. Generate manually with `pnpm compliance:report`
3. Check `reports/` directory in your local repo

---

## 📞 Support

For issues with:
- **Migrations**: Check `docs/migration-guardrails.md`
- **Compliance**: Review `age_verification_logs` table schema
- **CI/CD**: Check GitHub Actions workflow logs
