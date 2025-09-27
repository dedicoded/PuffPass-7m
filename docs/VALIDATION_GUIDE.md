# System Validation Guide

This guide explains how to validate your PuffPass system using both JavaScript and TypeScript validation scripts.

## Quick Start

For **v0 runtime** (JavaScript only):
\`\`\`bash
npm run validate-js
\`\`\`

For **local development** (TypeScript with tsx):
\`\`\`bash
npm run validate-all
\`\`\`

## Available Validation Commands

### JavaScript Commands (v0 Compatible)

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run validate-js` | Full system validation | **Primary validation in v0** |
| `npm run test-db-js` | Database connection test | Debug DB issues |
| `npm run test-auth-js` | Authentication system test | Debug auth/crypto issues |
| `npm run check-env-server` | Server environment variables | Check sensitive env vars |

### TypeScript Commands (Local Development)

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run validate-all` | Full system validation | Local development |
| `npm run test-db` | Database connection test | Local DB debugging |
| `npm run check-jwt` | JWT rotation status | JWT system debugging |
| `npm run rotate-jwt` | Rotate JWT secrets | Security maintenance |
| `npm run system-status` | Comprehensive status | System monitoring |

## Validation Sequence

The validation process follows this sequence:

1. **Database Connection** - Tests Neon database connectivity and schema
2. **Authentication System** - Tests bcryptjs password hashing and auth flow  
3. **Environment Variables** - Validates required environment variables

## Environment Requirements

### Required Environment Variables

- `DATABASE_URL` - Neon database connection string
- `WALLETCONNECT_PROJECT_ID` - WalletConnect integration
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - NextAuth.js URL configuration

### Optional Environment Variables

- `USERNAME` - For audit trail attribution in validation logs

## Troubleshooting

### Common Issues

**CDN Import Errors**
- Use JavaScript commands (`npm run validate-js`) in v0 runtime
- JavaScript commands avoid TypeScript compilation and CDN imports

**Database Connection Failures**
- Verify `DATABASE_URL` is set correctly
- Check Neon integration status in project settings
- Run `npm run test-db-js` for detailed connection diagnostics

**Authentication Errors**
- Verify bcryptjs is properly bundled (not from CDN)
- Run `npm run test-auth-js` to test crypto utilities
- Check `next.config.mjs` has proper bcryptjs configuration

**Environment Variable Issues**
- Run `npm run check-env-server` to verify sensitive variables
- Check Vercel project settings for missing variables

## Best Practices

1. **Always validate before deployment**
   \`\`\`bash
   npm run validate-js
   \`\`\`

2. **Use appropriate commands for your environment**
   - v0 runtime: JavaScript commands (`-js` suffix)
   - Local development: TypeScript commands

3. **Check logs for detailed error information**
   - All validation scripts provide detailed error messages
   - Look for specific failure points in the validation sequence

4. **Set USERNAME for audit trails**
   \`\`\`bash
   USERNAME=your-name npm run validate-js
   \`\`\`

## Integration with CI/CD

The validation scripts are designed to work in automated environments:

- Exit code 0 = Success
- Exit code 1 = Failure
- Detailed logging for debugging
- Audit trail support with USERNAME environment variable

Example GitHub Actions usage:
\`\`\`yaml
- name: Validate System
  run: npm run validate-js
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    USERNAME: github-actions
