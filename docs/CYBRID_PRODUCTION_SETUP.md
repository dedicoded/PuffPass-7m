# Cybrid Production Setup - MyCora Sandbox

## Your Cybrid Configuration

Based on your Cybrid dashboard, here are your credentials:

### Organization Details
- **Organization Name**: MyCora
- **Organization GUID**: `e658f582bfe3d7fcc8f6985ab918dad9`

### Bank Details  
- **Bank Name**: MyCora
- **Bank GUID**: `b90128ef166ec0158c4a3627776600c8`
- **Bank Type**: Sandbox
- **Fiat Assets**: USD
- **Countries**: US

### API Credentials
- **Client ID**: `UZxtGEcVXi6_rCHlcQjPcAp1wyNrhEGUtobmcCbBJ0w`
- **Client Secret**: (You need to retrieve this from your Cybrid dashboard)

### Bank Accounts Created
Your MyCora bank has three accounts set up:
1. **Reserve Account** (`d4a9...fef5`) - 0.00 USD
2. **Gas Account** (`f567...f166`) - 0.00 USD  
3. **Fee Account** (`1c57...15c1`) - 0.00 USD

## Environment Variables Required

Add these to your Vercel project environment variables:

\`\`\`env
# Cybrid API Configuration
CYBRID_API_URL="https://bank.sandbox.cybrid.app"
CYBRID_ORG_GUID="e658f582bfe3d7fcc8f6985ab918dad9"
CYBRID_BANK_GUID="b90128ef166ec0158c4a3627776600c8"
CYBRID_CLIENT_ID="UZxtGEcVXi6_rCHlcQjPcAp1wyNrhEGUtobmcCbBJ0w"
CYBRID_CLIENT_SECRET="your_client_secret_here"
CYBRID_WEBHOOK_SECRET="your_webhook_secret_here"
\`\`\`

## How to Get Your Client Secret

1. Go to your Cybrid dashboard: https://bank.sandbox.cybrid.app
2. Navigate to **API Keys** tab
3. Find the Client ID: `UZxtGEcVXi6_rCHlcQjPcAp1wyNrhEGUtobmcCbBJ0w`
4. Click to reveal or regenerate the **Client Secret**
5. Copy the secret and add it to your environment variables

## Testing Real Transactions

Once your environment variables are set, the system will automatically:

1. **Authenticate** with Cybrid using OAuth 2.0
2. **Create customers** for new users automatically
3. **Generate quotes** for crypto purchases
4. **Execute trades** on the Cybrid platform
5. **Record transactions** in your Neon database

### Test Flow

\`\`\`bash
# 1. User initiates crypto payment on /onramp page
# 2. System calls: POST /api/payments/cybrid
# 3. Cybrid provider:
#    - Gets OAuth token
#    - Creates/retrieves customer
#    - Creates quote for BTC/ETH purchase
#    - Executes trade
#    - Returns transaction ID
# 4. Transaction recorded in database
# 5. User sees confirmation
\`\`\`

## Current System Status

✅ **Pluggable Architecture** - Provider pattern implemented  
✅ **Cybrid Provider** - Full implementation with OAuth, quotes, trades  
✅ **Database Integration** - Neon PostgreSQL connected  
✅ **Customer Management** - Automatic customer creation  
✅ **Transaction Recording** - All trades logged to database  
✅ **Error Handling** - Graceful fallback to test mode if not configured  

## What Happens Now

### With Full Configuration (All env vars set):
- **Real blockchain transactions** through Cybrid
- **Live crypto purchases** (sandbox environment)
- **Actual trade execution** on Cybrid platform
- **Real transaction IDs** from Cybrid API

### Without Full Configuration (Missing env vars):
- **Test mode** automatically activated
- **Simulated transactions** with test IDs
- **No real money** or crypto involved
- **Safe for development** and testing

## Next Steps for Production

When ready to move from sandbox to production:

1. **Complete KYC/Compliance** - Verify your business with Cybrid
2. **Get Production Credentials** - Request production API access
3. **Update Environment Variables**:
   \`\`\`env
   CYBRID_API_URL="https://bank.production.cybrid.app"
   # Use production GUIDs and credentials
   \`\`\`
4. **Enable Real Money** - Fund your bank accounts
5. **Test Small Transactions** - Start with minimal amounts
6. **Monitor Closely** - Watch all transactions in Cybrid dashboard

## Support

- **Cybrid Documentation**: https://docs.cybrid.xyz
- **Cybrid Support**: support@cybrid.xyz
- **Your Account Manager**: Check your Cybrid dashboard

## Webhook Security

Your webhook endpoints are now protected with HMAC SHA-256 signature verification to prevent spoofed requests.

### Setup Webhook Secret

1. Go to your Cybrid dashboard webhook settings
2. Generate or retrieve your webhook secret
3. Add to environment variables:
   \`\`\`env
   CYBRID_WEBHOOK_SECRET="your_webhook_secret_here"
   \`\`\`

### How It Works

- Cybrid sends `X-Cybrid-Signature` header with each webhook
- System verifies signature using HMAC SHA-256
- Invalid signatures are rejected with 401 status
- All webhook attempts (valid/invalid) are logged to `audit_logs` table

### Audit Trail

Every webhook event is logged with:
- **Status**: `processed`, `invalid_signature`, `ignored`, `error`
- **Metadata**: Event type, object GUID, status changes
- **Timestamp**: When the webhook was received
- **Actor Type**: `webhook` for easy filtering

Query webhook logs:
\`\`\`sql
SELECT * FROM audit_logs 
WHERE actor_type = 'webhook' 
ORDER BY created_at DESC 
LIMIT 100;
\`\`\`

## Testing Your Integration

### 1. Sandbox End-to-End Test

Test the complete flow from OAuth to trade execution:

\`\`\`bash
# Install dependencies
npm install

# Run sandbox test
npx ts-node scripts/test-cybrid-sandbox.ts
\`\`\`

This will:
- ✓ Authenticate with Cybrid OAuth
- ✓ Create a test customer
- ✓ Generate a quote for $10 USDC
- ✓ Execute the trade
- ✓ Return trade GUID for monitoring

### 2. Webhook Handler Test

Test your webhook endpoint locally:

\`\`\`bash
# Start your dev server
npm run dev

# In another terminal, run webhook test
npx ts-node scripts/test-cybrid-webhook.ts
\`\`\`

This simulates:
- Trade completed event
- Trade failed event  
- Unknown event (ignored)

Check your database after running:
\`\`\`sql
-- Check transaction updates
SELECT * FROM transactions WHERE provider = 'cybrid' ORDER BY updated_at DESC;

-- Check webhook audit logs
SELECT * FROM audit_logs WHERE actor_type = 'webhook' ORDER BY created_at DESC;
\`\`\`

### 3. Manual Testing Checklist

Before going live, verify:

- [ ] OAuth token generation works
- [ ] Customer creation succeeds
- [ ] Quote generation returns valid prices
- [ ] Trade execution completes
- [ ] Webhook signature verification works
- [ ] Transaction status updates in database
- [ ] Audit logs capture all events
- [ ] Error handling works (try invalid data)

## Architecture Notes

The payment system is designed to be **provider-agnostic**:

\`\`\`typescript
// Current setup (Cybrid only)
paymentRegistry.register(new CybridProvider())

// Future: Add more providers
// paymentRegistry.register(new SphereProvider())
// paymentRegistry.register(new StripeProvider())
\`\`\`

This means you can add Sphere or other providers later without changing your application code - just register them in the registry and they'll be available.
