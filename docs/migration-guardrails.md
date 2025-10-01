# Migration Guardrails & Compliance Reporting

This document explains how to safely manage database migrations and generate compliance reports for PuffPass.

## Migration Guardrails

### Overview

The migration guardrail system validates SQL migrations before applying them to prevent runtime errors and schema conflicts.

### Features

- **Schema validation**: Checks that required tables exist before running migrations
- **Dry-run testing**: Executes migrations in a transaction and rolls back to catch errors
- **Auto-versioning**: Generates timestamped migration files automatically
- **Idempotent migrations**: Supports `IF NOT EXISTS` patterns for safe re-runs

### Usage

#### CLI Command

\`\`\`bash
# Run a safe migration with validation
pnpm migrate:safe "ALTER TABLE puff_transactions ADD COLUMN IF NOT EXISTS provider_id INT;" add-provider-id

# The script will:
# 1. Validate the SQL syntax
# 2. Check for required tables
# 3. Dry-run in a transaction
# 4. Apply the migration
# 5. Save to migrations/ folder with timestamp
\`\`\`

#### Programmatic Usage

\`\`\`js
import { runMigration } from "./scripts/migrationGuardrail.js";

const migration = `
  CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );
`;

await runMigration(migration, {
  requiredTables: [], // Optional: tables that must exist first
  name: "create-providers-table"
});
\`\`\`

### CI/CD Integration

The GitHub Actions workflow (`.github/workflows/migration-guardrail.yml`) automatically validates all migrations in pull requests:

1. Triggers on PRs that modify `migrations/` or `scripts/`
2. Runs guardrail validation on each migration file
3. Fails the PR if any migration has errors
4. Protects production from unsafe migrations

### Best Practices

1. **Always use the guardrail**: Never run raw SQL directly in production
2. **Write idempotent migrations**: Use `IF NOT EXISTS`, `IF NOT NULL`, etc.
3. **Test locally first**: Run migrations in development before committing
4. **Version control**: Commit generated migration files to Git
5. **Document changes**: Use descriptive migration names

## Compliance Reporting

### Overview

The compliance report generator creates regulator-ready monthly reports from age verification audit logs.

### Features

- **Monthly summaries**: Pass/fail rates, total events, anomalies
- **Daily trends**: Charts showing verification patterns over time
- **Top routes**: Most frequently verified endpoints
- **Suspicious activity**: IPs with repeated failures
- **Audit samples**: Raw log entries for evidence
- **Multiple formats**: Markdown reports + CSV exports

### Usage

\`\`\`bash
# Generate a compliance report for September 2025
pnpm compliance:report 09 2025

# Output files:
# - compliance-reports/compliance-report-2025-09.md
# - compliance-reports/compliance-data-2025-09.csv
\`\`\`

### Report Contents

1. **Executive Summary**: High-level metrics and anomalies
2. **Key Metrics Table**: Pass/fail/skip counts and percentages
3. **Daily Trends**: Day-by-day verification activity
4. **Top Routes**: Most accessed protected endpoints
5. **Suspicious Activity**: IPs with >5 failures
6. **Sample Audit Logs**: 10 recent verification events
7. **Compliance Statement**: Retention policy and contact info

### Automation

You can schedule monthly reports using cron or GitHub Actions:

\`\`\`yaml
# .github/workflows/monthly-compliance.yml
name: Monthly Compliance Report

on:
  schedule:
    - cron: '0 0 1 * *' # First day of each month

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm compliance:report $(date -d "last month" +%m) $(date +%Y)
      - uses: actions/upload-artifact@v3
        with:
          name: compliance-report
          path: compliance-reports/
\`\`\`

### Regulator Handoff

The generated reports are designed for direct submission to regulators:

- **Markdown format**: Human-readable, professional layout
- **CSV format**: Easy import into Excel/Google Sheets
- **Evidence-based**: Includes raw audit log samples
- **Retention statement**: Documents 2-year log retention policy

## Troubleshooting

### Migration Errors

**Error**: `relation "table_name" does not exist`
- **Solution**: Add the table to `requiredTables` array or create it first

**Error**: `syntax error at or near "..."`
- **Solution**: Check SQL syntax, use PostgreSQL-compatible statements

**Error**: `column "column_name" already exists`
- **Solution**: Use `IF NOT EXISTS` or `ADD COLUMN IF NOT EXISTS`

### Compliance Report Errors

**Error**: `relation "age_verification_logs" does not exist`
- **Solution**: Run `scripts/12-create-age-verification-logs.sql` first

**Error**: `No data for specified month`
- **Solution**: Check date range, ensure audit logging is enabled

## Support

For questions or issues:
- Check the [README](../README.md) for setup instructions
- Review existing migrations in `migrations/` folder
- Contact: compliance@puffpass.com
