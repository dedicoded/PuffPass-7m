# XaiGate Integration Setup Guide

This guide will help you set up XaiGate for crypto payments in PuffPass.

## Overview

XaiGate is a custodial wallet API service that enables crypto payments. PuffPass uses XaiGate to:
- Accept USDC payments on Ethereum, BSC, and Tron networks
- Generate unique wallet addresses for each payment
- Monitor incoming transactions automatically
- Credit PUFF tokens when payments are confirmed

## Prerequisites

1. A XaiGate merchant account at [wallet.xaigate.com](https://wallet.xaigate.com)
2. Access to your Vercel project environment variables

## Step 1: Get Your XaiGate Credentials

1. **Sign up for XaiGate**
   - Go to [wallet.xaigate.com](https://wallet.xaigate.com)
   - Create a merchant account
   - Complete the verification process

2. **Get Your API Key**
   - Navigate to **Credential** in the left sidebar
   - You'll see your API Key displayed (format: `60472f18-d709-47f0-9e65-2eaaf33991a7`)
   - Click the copy icon to copy your API Key
   - **Important**: Toggle "Enable APIKey" to **Yes** to activate your API key
   - Keep this key secure - it provides full access to your XaiGate account

## Step 2: Configure Environment Variables

Add the following environment variables to your Vercel project:

### Required Variables

\`\`\`bash
# XaiGate API Configuration
XAIGATE_API_KEY=60472f18-d709-47f0-9e65-2eaaf33991a7

# Optional: Webhook Secret (get from XaiGate webhook settings)
XAIGATE_WEBHOOK_SECRET=your_webhook_secret_here

# Optional: API URL (defaults to production)
XAIGATE_API_URL=https://wallet-api.xaigate.com/api/v1
\`\`\`

### How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `XAIGATE_API_KEY` with your API key from the credential page
4. Select the appropriate environments (Production, Preview, Development)
5. Click **Save**
6. Redeploy your application for changes to take effect

## Step 3: Configure Webhooks

Webhooks allow XaiGate to notify your app when payments are received.

1. **Get Your Webhook URL**
   - Your webhook URL is: `https://your-domain.com/api/xaigate/webhook`
   - For example: `https://puffpass.vercel.app/api/xaigate/webhook`

2. **Configure in XaiGate Dashboard**
   - Navigate to **Webhook** in the left sidebar
   - Enter your webhook URL
   - Configure webhook settings:
     - ✅ Enable webhook notifications
     - ✅ Select "Deposit" events
     - ✅ Select "Confirmation" events
   - Copy the webhook secret if provided
   - Save the configuration

## Step 4: Configure Payment Settings

### Supported Networks

XaiGate supports the following networks for USDC:
- **Ethereum (ERC20)** - ~15 seconds, ~$2-10 gas fees
- **BSC (BEP20)** - ~3 seconds, ~$0.10-0.50 gas fees (recommended)
- **Tron (TRC20)** - ~3 seconds, ~$1-2 gas fees

### Default Configuration

The default configuration in `lib/xaigate-config.ts`:
- **Default Network**: BSC (BEP20) - fastest and cheapest
- **Default Currency**: USDC
- **Confirmation Threshold**: 12 confirmations for payment finality

### Customizing Settings

To change the default network or currency, edit `lib/xaigate-config.ts`:

\`\`\`typescript
export const XAIGATE_CONFIG = {
  defaultNetwork: 'BSC', // Change to 'ETH' or 'TRX'
  defaultCurrency: 'USDC',
  // ... other settings
}
\`\`\`

## Step 5: Test the Integration

### Test Payment Flow

1. **Create a Test Payment**
   - Go to `/onramp` page in your app
   - Enter an amount (e.g., $10)
   - Click "Create Payment"

2. **Verify Payment Address**
   - A unique wallet address should be generated
   - A QR code should be displayed
   - The payment status should show "Pending"

3. **Send Test Payment**
   - Send USDC to the generated address
   - Use a small amount for testing (e.g., $1)
   - Wait for confirmations

4. **Verify Payment Confirmation**
   - The webhook should receive the notification
   - Payment status should update to "Completed"
   - PUFF tokens should be credited to the user's account

### Check Logs

Monitor your application logs for:
- `[v0] XAIGATE: Payment created` - Payment address generated
- `[v0] XAIGATE: Webhook received` - Webhook notification received
- `[v0] XAIGATE: Payment confirmed` - Payment processed successfully

## Troubleshooting

### Issue: "XAIGATE running in MOCK mode"

**Cause**: API key is not configured or not enabled

**Solution**: 
1. Go to [Credential page](https://wallet.xaigate.com/merchant/credential)
2. Verify your API key is displayed
3. **Toggle "Enable APIKey" to "Yes"**
4. Copy the API key and add it to `XAIGATE_API_KEY` environment variable
5. Redeploy your application after adding the variable

### Issue: Webhook not receiving notifications

**Cause**: Webhook URL not configured or incorrect

**Solution**:
1. Verify webhook URL in XaiGate dashboard
2. Ensure URL is publicly accessible (not localhost)
3. Check webhook secret matches environment variable
4. Review webhook logs in XaiGate dashboard

### Issue: Payment not confirming

**Cause**: Insufficient confirmations or network issues

**Solution**:
1. Check transaction on blockchain explorer
2. Verify correct network (BSC, ETH, TRX)
3. Wait for required confirmations (12 blocks)
4. Check webhook logs for errors

### Issue: Wrong amount credited

**Cause**: Exchange rate or decimal conversion issue

**Solution**:
1. Verify USDC amount sent matches expected amount
2. Check conversion rate (100 PUFF = $1 USDC)
3. Review transaction details in database

## Security Best Practices

1. **Protect Your API Key**
   - Never commit API keys to version control
   - Use environment variables only
   - Rotate keys periodically

2. **Verify Webhook Signatures**
   - Always verify webhook signatures
   - Use the webhook secret from XaiGate dashboard
   - Reject webhooks with invalid signatures

3. **Monitor Transactions**
   - Set up alerts for large transactions
   - Review payment logs regularly
   - Monitor for suspicious activity

4. **Use Confirmation Thresholds**
   - Wait for sufficient confirmations (12+ blocks)
   - Don't credit accounts on 0-confirmation transactions
   - Consider higher thresholds for large amounts

## Production Checklist

Before going live with XaiGate payments:

- [ ] API credentials configured in production environment
- [ ] Webhook URL configured and tested
- [ ] Test payments completed successfully
- [ ] Confirmation thresholds set appropriately
- [ ] Error monitoring and alerting configured
- [ ] Customer support process for payment issues
- [ ] Backup payment method available
- [ ] Terms of service updated to include crypto payments
- [ ] Compliance requirements met for your jurisdiction

## Support

For XaiGate-specific issues:
- Documentation: [xaigate.gitbook.io/api-docs](https://xaigate.gitbook.io/api-docs)
- Support: Contact XaiGate support team

For PuffPass integration issues:
- Check application logs
- Review this setup guide
- Contact your development team

## Next Steps

After completing the setup:
1. Test the payment flow thoroughly
2. Monitor the first few real transactions closely
3. Set up monitoring and alerts
4. Train your team on handling payment issues
5. Prepare customer support documentation

---

**Last Updated**: January 2025
**Integration Version**: 1.0
