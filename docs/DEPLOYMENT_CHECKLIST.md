# Deployment Checklist

## Pre-Deployment Validation

Before deploying to production, run the comprehensive system validation:

\`\`\`bash
# Set your username for audit logging
export USERNAME=your-username

# Run all system checks
npm run validate-all
\`\`\`

## What Gets Validated

### 1. System Configuration (`validate-system.ts`)
- ✅ Environment variables present and valid
- ✅ Database connection string format
- ✅ JWT secret strength and format
- ✅ Required integrations configured

### 2. Quick Health Check (`quick-health-check.ts`)
- ✅ Database connectivity (< 5 seconds)
- ✅ JWT system operational
- ✅ Cache systems responsive
- ✅ External API endpoints reachable

### 3. System Status (`system-status.ts`)
- ✅ Detailed performance metrics
- ✅ JWT rotation compliance windows
- ✅ Database table health
- ✅ Audit log integrity

### 4. Database Connection Test (`test-database-connection.ts`)
- ✅ Connection pooling working
- ✅ SSL encryption enabled
- ✅ Query performance acceptable
- ✅ Schema migrations applied

### 5. JWT System Verification (`verify-jwt-system.ts`)
- ✅ Token generation/validation cycle
- ✅ Rotation schedule compliance
- ✅ Audit trail completeness
- ✅ Security policy adherence

## Automated Validation

The GitHub Actions workflow runs these checks automatically:
- ✅ On every push to main/develop
- ✅ On pull requests
- ✅ Daily at 6 AM UTC
- ✅ Uploads validation reports as artifacts

## Manual Override

If you need to deploy despite validation warnings (not recommended):

\`\`\`bash
# Skip validation (emergency only)
npm run build
npm run start

# Or deploy with warnings acknowledged
SKIP_VALIDATION=true npm run validate-all
\`\`\`

## Troubleshooting

### Common Issues

1. **USERNAME not set**
   \`\`\`bash
   export USERNAME=your-username
   \`\`\`

2. **Database connection timeout**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Confirm database is running

3. **JWT rotation overdue**
   \`\`\`bash
   npm run rotate-jwt
   \`\`\`

4. **Environment variables missing**
   - Check .env.local file
   - Verify Vercel project settings
   - Confirm integration setup

## Success Criteria

All checks must pass with ✅ status:
- Database connectivity: ✅
- JWT rotation system: ✅  
- Environment variables: ✅
- System health: ✅
- Audit compliance: ✅

Only deploy when you see: **"🎉 All system checks passed successfully!"**
