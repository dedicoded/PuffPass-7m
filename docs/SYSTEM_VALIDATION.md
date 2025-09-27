# System Validation Guide

This guide explains how to use the automated system validation tools for your JWT rotation and database systems.

## Quick Commands

### 🚀 Full System Validation
\`\`\`bash
npm run validate-system
\`\`\`
**What it does:**
- Tests database connectivity
- Checks JWT secret expiration status
- Automatically rotates secrets if needed
- Verifies JWT system functionality
- Generates comprehensive audit report

### ⚡ Quick Health Check
\`\`\`bash
npm run health-check
\`\`\`
**What it does:**
- Fast database connectivity test
- JWT expiration status check
- No automatic rotation (read-only)
- Perfect for monitoring scripts

## Individual Component Tests

### Database Connection
\`\`\`bash
npm run test-db
\`\`\`
Tests database connectivity and table accessibility.

### JWT Status Check
\`\`\`bash
npm run check-jwt
\`\`\`
Checks current JWT secret expiration without making changes.

### Manual JWT Rotation
\`\`\`bash
npm run rotate-jwt
\`\`\`
Manually rotates JWT secrets with full audit logging.

### JWT System Verification
\`\`\`bash
npm run verify-jwt
\`\`\`
Tests JWT token creation and verification functionality.

## Automation Integration

### GitHub Actions
The system includes three automated workflows:

1. **Compliance Check** (`.github/workflows/jwt-rotation-check.yml`)
   - Runs weekly and on main branch pushes
   - Fails builds if secrets are stale
   - Automated compliance monitoring

2. **Manual Rotation** (`.github/workflows/jwt-manual-rotation.yml`)
   - Triggered manually from GitHub Actions UI
   - Includes operator tracking and reason logging
   - Updates GitHub secrets automatically

3. **Emergency Rotation** (`.github/workflows/jwt-emergency-rotation.yml`)
   - For security incidents
   - Immediate token revocation option
   - Creates incident tracking issues

### Pre-deployment Validation
Add to your deployment pipeline:
\`\`\`bash
npm run validate-system
\`\`\`
This ensures your system is healthy before going live.

## Understanding Output

### Status Indicators
- ✅ **Success**: Component is healthy
- ⚠️ **Warning**: Attention needed (e.g., secret expires soon)
- ❌ **Error**: Critical issue requiring immediate action

### Overall System Status
- **Healthy**: All systems operational
- **Needs Attention**: Warnings present, review recommended
- **Critical**: Errors found, deployment should be blocked

## Compliance Features

### Audit Logging
All rotations are logged with:
- Operator identification
- Timestamp
- Reason for rotation
- New secret metadata

### 90-Day Rotation Cycle
- Secrets expire after 90 days
- Warnings start at 30 days remaining
- Critical alerts at 7 days remaining
- Automatic rotation when expired

### Verification Testing
Every validation includes:
- Token creation testing
- Token verification testing
- Payload integrity checks
- Secret key functionality validation

## Troubleshooting

### Database Connection Issues
1. Check environment variables are set
2. Verify network connectivity
3. Confirm database permissions
4. Review connection string format

### JWT Rotation Issues
1. Ensure database tables exist (`jwt_secrets`, `audit_logs`)
2. Check write permissions to database
3. Verify secret generation functionality
4. Review audit log entries

### Integration Issues
1. Confirm Neon integration is active
2. Check environment variable availability
3. Verify database schema matches expectations
4. Test individual components separately

## Best Practices

1. **Run health checks regularly** - Use `npm run health-check` in monitoring
2. **Validate before deployment** - Always run `npm run validate-system`
3. **Monitor rotation status** - Set up alerts for JWT expiration warnings
4. **Keep audit logs** - Maintain rotation history for compliance
5. **Test after changes** - Verify system health after any auth-related updates

## Environment Requirements

- Node.js with TypeScript support
- Neon database connection
- Required environment variables:
  - `DATABASE_URL`
  - `POSTGRES_URL` (optional, for pooling)
  - Any custom JWT configuration variables
