# Cybrid Integration Quickstart

## 🚀 Get Started in 5 Minutes

This guide will get your Cybrid integration working for the DC MVP launch.

### Step 1: Update Environment Variables

Based on your Cybrid dashboard, update your `.env` file with the correct credentials:

\`\`\`bash
# Cybrid Configuration (from your MyCora bank)
CYBRID_API_URL=https://bank.sandbox.cybrid.app
CYBRID_ORG_GUID=e658f582bfe3d7fcc8f6985ab918dad9
CYBRID_BANK_GUID=b90128ef166ec0158c4a3627776600c8
CYBRID_CLIENT_ID=HRGTSnmLPzTnzx_JdMFGSi8DC6wvG1K6r8ngCi3b4rM
CYBRID_CLIENT_SECRET=<get_from_cybrid_dashboard>
CYBRID_WEBHOOK_SECRET=<generate_random_32_char_string>
\`\`\`

**Where to find your Client Secret:**
1. Go to [Cybrid Dashboard](https://dashboard.cybrid.app)
2. Navigate to **API Keys**
3. Find **Bank: MyCora** section
4. Click **Show Secret** or **Regenerate Secret**
5. Copy and paste into your `.env` file

### Step 2: Validate Configuration

Run the validation script to ensure everything is set up correctly:

\`\`\`bash
npm run validate-cybrid
\`\`\`

This will check:
- ✅ All environment variables are present
- ✅ OAuth token generation works
- ✅ Bank access is verified
- ✅ Bank accounts are accessible
- ✅ Supported crypto assets are available

### Step 3: Test End-to-End Flow

Test the complete payment flow in sandbox:

\`\`\`bash
npm run test-cybrid
\`\`\`

This simulates:
1. Creating a customer
2. Getting a quote for BTC purchase
3. Executing a trade
4. Checking transaction status

### Step 4: Test Webhook Handler

Test your webhook endpoint locally:

\`\`\`bash
npm run test-cybrid-webhook
\`\`\`

This verifies:
- Webhook signature validation
- Transaction status updates
- Audit log recording

## 📊 Your Cybrid Setup

### Bank Accounts (from dashboard)

| Account | GUID | Purpose |
|---------|------|---------|
| Reserve | d4a9...fef5 | Holds customer funds |
| Gas | f567...f166 | Pays blockchain fees |
| Fee | 1c57...15c1 | Collects platform fees |

### Supported Features

- ✅ Customer creation and management
- ✅ Crypto trading (BTC, ETH, USDC, etc.)
- ✅ Real-time quotes
- ✅ Trade execution
- ✅ Webhook notifications
- ✅ Transaction status tracking
- ✅ Audit logging for compliance

## 🔄 Payment Flow

\`\`\`
User initiates payment
    ↓
Create/Get Cybrid customer
    ↓
Request quote (BTC-USD)
    ↓
Execute trade
    ↓
Record in database
    ↓
Webhook updates status
    ↓
Payment complete
\`\`\`

## 🔐 Security Features

- **OAuth 2.0** - Automatic token management with refresh
- **HMAC Signatures** - Webhook verification with SHA-256
- **Audit Logs** - Every webhook attempt logged to database
- **Constant-time Comparison** - Prevents timing attacks
- **Scoped Access** - Tokens limited to specific org/bank

## 🧪 Testing Checklist

Before going live, verify:

- [ ] Environment variables are set correctly
- [ ] Validation script passes all checks
- [ ] End-to-end test creates customer successfully
- [ ] End-to-end test executes trade successfully
- [ ] Webhook handler validates signatures
- [ ] Webhook handler updates transaction status
- [ ] Audit logs are being recorded
- [ ] Database transactions table is populated

## 🚨 Troubleshooting

### "Invalid client credentials"
- Double-check `CYBRID_CLIENT_ID` and `CYBRID_CLIENT_SECRET`
- Ensure you're using the **Bank Client ID** (HRGTSnmLPzTnzx_JdMFGSi8DC6wvG1K6r8ngCi3b4rM)
- Verify secret hasn't been regenerated

### "Bank not found"
- Confirm `CYBRID_BANK_GUID` is `b90128ef166ec0158c4a3627776600c8`
- Check API key has access to MyCora bank

### "Insufficient scope"
- Verify OAuth scope includes: `organizations:{ORG_GUID} banks:{BANK_GUID}`
- Check both GUIDs are correct in `.env`

### Webhook signature fails
- Ensure `CYBRID_WEBHOOK_SECRET` matches what you configured in Cybrid dashboard
- Verify webhook URL is publicly accessible (use ngrok for local testing)

## 📞 Next Steps

1. **Complete validation** - Run all test scripts
2. **Configure webhooks** - Set up webhook URL in Cybrid dashboard
3. **Test in UI** - Try a payment through your app
4. **Monitor logs** - Check audit_logs table for activity
5. **Go live** - Deploy to production when ready

## 🔗 Resources

- [Cybrid API Docs](https://docs.cybrid.xyz/)
- [Cybrid Dashboard](https://dashboard.cybrid.app)
- [Your Bank: MyCora](https://dashboard.cybrid.app/banks/b90128ef166ec0158c4a3627776600c8)
- [API Keys](https://dashboard.cybrid.app/api-keys)

## 💡 Pro Tips

- Use sandbox for all testing - never test with real money
- Monitor the `audit_logs` table for security events
- Set up alerts for failed webhook signatures
- Rotate secrets every 90 days
- Keep separate credentials for dev/staging/production
