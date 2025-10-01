# PuffPass Quick Reference

Fast lookup for common commands and workflows.

---

## 🚀 Setup & Installation

\`\`\`bash
# Clone and install
git clone <repo-url>
cd puffpass
pnpm install

# Run diagnostic check BEFORE setup (recommended)
pnpm diagnose:compliance

# Setup compliance infrastructure
pnpm setup:compliance

# Verify everything is working
pnpm verify:compliance

# Run end-to-end smoke test
pnpm test:compliance

# New contributors: run health check
pnpm doctor:compliance
\`\`\`

---

## 🔧 Development


---

## 🗄️ Database & Migrations


---

## 📊 Compliance & Reporting

\`\`\`bash
# Pre-flight check (catches issues before setup)
pnpm diagnose:compliance

# Setup compliance infrastructure
pnpm setup:compliance

# Verify compliance setup
pnpm verify:compliance

# Run end-to-end smoke test
pnpm test:compliance

# Check local environment (for new contributors)
pnpm doctor:compliance

# Generate monthly report
pnpm compliance:monthly

# Generate multi-org reports
pnpm compliance:multi-org
\`\`\`

---

## 🔐 Security & Auth


---

## 🏗️ Build & Deploy


---

## 🧪 Testing

\`\`\`bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:auth
pnpm test:coverage

# Run compliance smoke test
pnpm test:compliance

# Run in CI mode
pnpm test:ci
\`\`\`

---

## 🔍 Debugging & Diagnostics


---

## 📁 Important Files

\`\`\`
puffpass/
├── app/
│   ├── admin/page.tsx          # Admin dashboard
│   └── api/                    # API routes
├── components/
│   └── admin/                  # Admin components
├── scripts/
│   ├── diagnoseCompliance.js   # Pre-flight diagnostic check
│   ├── setupCompliance.js      # One-liner setup
│   ├── verifyCompliance.js     # Verification script
│   ├── smokeTestCompliance.js  # End-to-end smoke test
│   ├── doctorCompliance.js     # Health check for contributors
│   ├── v0SafeWrapper.js        # Safe migration wrapper
│   └── *.sql                   # Migration files
├── docs/
│   ├── compliance-setup-guide.md
│   ├── v0-safe-workflow.md
│   └── quick-reference.md
└── .github/workflows/
    ├── compliance-test.yml     # CI/CD compliance test
    └── monthly-compliance-report.yml  # Automated monthly reports
\`\`\`

---

## 🌐 URLs


---

## 📧 Environment Variables


---

## 🆘 Common Issues

### Added diagnostic check as first troubleshooting step
### "Getting errors during setup"
\`\`\`bash
# Run diagnostic check first
pnpm diagnose:compliance

# This will tell you exactly what's wrong:
# - Schema drift (wrong table names)
# - Missing environment variables
# - Database connection issues
\`\`\`

### "Table does not exist"
\`\`\`bash
pnpm setup:compliance
\`\`\`

### "Migration failed"
\`\`\`bash
pnpm migrate:validate
pnpm verify:compliance
\`\`\`

### "Email not sending"
Check `SENDGRID_API_KEY` in environment variables

### "Build failed"
\`\`\`bash
pnpm migrate:validate  # Check migrations
pnpm lint              # Check code quality
\`\`\`

### "Smoke test failed"
\`\`\`bash
# 1. Run diagnostic check
pnpm diagnose:compliance

# 2. Run setup if needed
pnpm setup:compliance

# 3. Verify database connection
pnpm test-db

# 4. Check DATABASE_URL is set
pnpm check-env
\`\`\`

### "CI/CD compliance test failed"
\`\`\`bash
# 1. Check GitHub Actions logs
# 2. Run locally to reproduce
pnpm test:compliance

# 3. Verify DATABASE_URL secret is set in GitHub
# Settings → Secrets → Actions → DATABASE_URL
\`\`\`

### "Monthly report not generating"
\`\`\`bash
# 1. Check GitHub Actions workflow is enabled
# 2. Verify SENDGRID_API_KEY secret is set
# 3. Check workflow logs for errors
# 4. Test locally
pnpm compliance:multi-org
\`\`\`

---

## 📚 Documentation


---

## 🎯 Quick Workflows

### New Contributor Onboarding
\`\`\`bash
# 1. Clone and install
git clone <repo-url>
cd puffpass
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Add DATABASE_URL, SENDGRID_API_KEY, etc.

# 3. Run diagnostic check
pnpm diagnose:compliance

# 4. Run health check
pnpm doctor:compliance

# 5. If health check fails, run setup
pnpm setup:compliance

# 6. Verify everything works
pnpm test:compliance
\`\`\`

### Adding a New Migration
\`\`\`bash
# 1. Write SQL
pnpm migrate:v0safe "CREATE TABLE ..." table-name

# 2. Verify it worked
pnpm verify:compliance

# 3. Commit and push
git add migrations/
git commit -m "Add new migration"
git push
\`\`\`

### Generating Compliance Report
\`\`\`bash
# 1. Generate report
pnpm compliance:monthly

# 2. Check email for CSV
# 3. Forward to regulators
\`\`\`

### Testing Compliance System
\`\`\`bash
# 1. Run diagnostic check
pnpm diagnose:compliance

# 2. Setup compliance
pnpm setup:compliance

# 3. Verify setup
pnpm verify:compliance

# 4. Run smoke test
pnpm test:compliance

# 5. Check for green checkmarks
\`\`\`

### Deploying to Production
\`\`\`bash
# 1. Validate locally
pnpm validate-all

# 2. Build
pnpm build

# 3. Deploy
git push  # Vercel auto-deploys
\`\`\`

---

## 💡 Pro Tips
