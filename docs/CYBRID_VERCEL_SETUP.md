# Cybrid Integration Setup for Vercel

## Quick Setup Guide

Your Cybrid Bank API credentials are ready to use. Follow these steps to add them to your Vercel project:

### 1. Add Environment Variables to Vercel

Go to your Vercel project settings and add these **secret** environment variables:

\`\`\`bash
CYBRID_CLIENT_ID=8CXVVa1a6m0c0L-8CeQ186RBOQX0NMlY4OrWa1nsD9
CYBRID_CLIENT_SECRET=JkzOlgsl4GOAPF5I6OOg-5T2DCkq4uBmlUyYny_0A_M
\`\`\`

**Important:** These are Bank-level credentials that allow customer operations. Keep them secret!

### 2. Verify Configuration

The following values are already configured in your code:

- **Organization GUID**: `059526698b52ef3827e417f794da7bfe`
- **Bank GUID**: `2a28078007155bdecf9f237834f3decd`
- **Reserve Account**: `4229014f138435ba0e8dfc3be1153ccb`
- **Gas Account**: `1dd9e5ab2387fed0282fb3309cc939ee`
- **Fee Account**: `1c1916b4b892cb81d6f73faf8a57cc34`

### 3. Test the Integration

After adding the environment variables:

1. Redeploy your Vercel project
2. Visit `/onramp` to test the Cybrid payment flow
3. Visit `/admin/cybrid` to view account balances

### 4. Troubleshooting

If you see authentication errors:

1. **401 Unauthorized**: Verify `CYBRID_CLIENT_SECRET` is set correctly in Vercel
2. **404 Not Found**: Check that you're using Bank-level credentials (not Organization credentials)
3. **Missing Configuration**: Ensure both `CYBRID_CLIENT_ID` and `CYBRID_CLIENT_SECRET` are set

### 5. Production Setup

When ready for production:

1. Generate production API keys in Cybrid Dashboard
2. Update environment variables in Vercel
3. Change `NEXT_PUBLIC_CYBRID_ENVIRONMENT` to `"production"`
4. Update API URLs to production endpoints

## API Endpoints

- **Auth**: `https://id.sandbox.cybrid.app/oauth/token`
- **Bank API**: `https://bank.sandbox.cybrid.app`

## Scopes

Your Bank API key has these scopes:
- `banks:read` - Read bank information
- `customers:read` - Read customer data
- `customers:write` - Create and update customers
- `accounts:read` - Read account balances
- `quotes:execute` - Get price quotes
- `trades:execute` - Execute trades

## Next Steps

1. Add the environment variables to Vercel (see step 1 above)
2. Test the `/onramp` page to verify Cybrid SDK loads correctly
3. Check `/admin/cybrid` to see your account balances
4. Review the Cybrid SDK integration in `components/cybrid-provider.tsx`
