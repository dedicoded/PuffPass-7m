# Cybrid Integration Setup

## Problem: 401 Invalid Client Error

If you're seeing `401 invalid_client` errors, it means the Cybrid credentials are invalid or expired.

## Root Cause

The fallback sandbox credentials in `lib/cybrid-config.ts` are either:
- Expired
- Invalid
- Don't match any actual Cybrid sandbox app

## Solution

You need to set up valid Cybrid credentials:

### Step 1: Get Cybrid Sandbox Credentials

1. Go to [Cybrid Dashboard](https://app.cybrid.xyz)
2. Sign in or create a sandbox account
3. Navigate to your sandbox application
4. Copy your **Client ID** and **Client Secret**
   - If the secret is expired, regenerate a new one

### Step 2: Set Environment Variables

Add these as **server-side** environment variables in your deployment:

\`\`\`bash
CYBRID_CLIENT_ID=your_actual_client_id_here
CYBRID_CLIENT_SECRET=your_actual_client_secret_here
\`\`\`

**Important:**
- Do NOT use the `NEXT_PUBLIC_` prefix (these must be server-side only)
- Remove any quotes, spaces, or newlines when pasting
- Set these in your deployment environment (Vercel, Netlify, etc.)

### Step 3: Redeploy

After setting the environment variables, redeploy your application.

### Step 4: Verify

Check the logs for:
\`\`\`
[v0] Cybrid auth diagnostics: {
  envVarsPresent: { clientId: true, clientSecret: true },
  usingFallback: false
}
\`\`\`

If `envVarsPresent.clientId` is `true`, your environment variables are set correctly.

## Testing Credentials Locally

You can test your credentials directly using curl:

### Test with client_secret_basic:
\`\`\`bash
curl -X POST https://id.sandbox.cybrid.app/oauth/token \
  -H "Authorization: Basic $(echo -n 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
\`\`\`

### Test with client_secret_post:
\`\`\`bash
curl -X POST https://id.sandbox.cybrid.app/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
\`\`\`

If you get a 200 response with an `access_token`, your credentials are valid.

## Diagnostic Logs

The token route now logs safe diagnostic information:
- Last 4 characters of credentials (for verification without exposing secrets)
- Whether environment variables are present
- Whether fallback credentials are being used

Check your deployment logs for these diagnostics to troubleshoot issues.
