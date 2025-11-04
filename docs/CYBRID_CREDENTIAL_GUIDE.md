# Cybrid Credential Configuration Guide

## 🔑 Understanding Your Cybrid Credentials

Based on your Cybrid dashboard screenshots, you have two sets of credentials:

### Organization-Level Credentials
- **Organization GUID**: `e658f582bfe3d7fcc8f6985ab918dad9`
- **Organization Client ID**: `UZxtGEcVXi6_rCHlcQjPcAp1wyNrhEGUtobmcCbBJ0w`
- Used for: Organization-wide operations

### Bank-Level Credentials  
- **Bank GUID**: `b90128ef166ec0158c4a3627776600c8`
- **Bank Client ID**: `HRGTSnmLPzTnzx_JdMFGSi8DC6wvG1K6r8ngCi3b4rM`
- **Bank Name**: MyCora
- Used for: Banking operations (customers, accounts, quotes, trades)

### User GUID
- **User GUID**: `27d81147e1098019c4387c53190027b0`
- **Email**: paygarjoe@yahoo.com
- **Permissions**: User Admin, Key Admin, Bank Admin, IDV Create

## 📋 Current Environment Variables

Your current `.env` file shows:

\`\`\`bash
CYBRID_API_URL=https://bank.sandbox.cybrid.app
CYBRID_ORG_GUID=059526698b52ef3827e417f794da7bfe  # ⚠️ Different from dashboard
CYBRID_BANK_GUID=2a28078007155bbdecf9f237834f3ded  # ⚠️ Different from dashboard
CYBRID_CLIENT_ID=a1JIAGZCzqVjm48qPoabmC6vlllttogXDvgDlKcaDZU  # ⚠️ Different from dashboard
CYBRID_CLIENT_SECRET=bzNQWNuJQqSkrgUPm1LbgUrEbFLkdkDQR7kk6GcQ
\`\`\`

## ✅ Recommended Configuration

For your **MyCora** bank to work correctly, update your environment variables to match your dashboard:

\`\`\`bash
# Cybrid API Configuration
CYBRID_API_URL=https://bank.sandbox.cybrid.app

# Organization Credentials (from API Keys page)
CYBRID_ORG_GUID=e658f582bfe3d7fcc8f6985ab918dad9
CYBRID_ORG_CLIENT_ID=UZxtGEcVXi6_rCHlcQjPcAp1wyNrhEGUtobmcCbBJ0w

# Bank Credentials (from API Keys page - "Bank: MyCora")
CYBRID_BANK_GUID=b90128ef166ec0158c4a3627776600c8
CYBRID_CLIENT_ID=HRGTSnmLPzTnzx_JdMFGSi8DC6wvG1K6r8ngCi3b4rM

# Client Secret (retrieve from Cybrid dashboard)
CYBRID_CLIENT_SECRET=your_client_secret_here

# Webhook Security (generate a random 32+ character string)
CYBRID_WEBHOOK_SECRET=your_webhook_secret_here
\`\`\`

## 🔍 How to Get Your Client Secret

1. Log into [Cybrid Dashboard](https://dashboard.cybrid.app)
2. Navigate to **API Keys** page
3. Find your **Bank: MyCora** section
4. Click **Show Secret** or **Regenerate Secret**
5. Copy the secret and add it to your environment variables

## 🧪 Validate Your Configuration

Run the validation script to test your credentials:

\`\`\`bash
npm run validate-cybrid
\`\`\`

This will:
- ✅ Check all required environment variables are set
- ✅ Test OAuth token generation
- ✅ Verify bank access
- ✅ List your bank accounts (Reserve, Gas, Fee)
- ✅ Check supported crypto assets

## 🏦 Your Bank Accounts

From your dashboard, you have three accounts set up:

| Account Type | GUID | Balance | Asset | State |
|-------------|------|---------|-------|-------|
| Reserve | d4a9...fef5 | 0.00 | USD | Created |
| Gas | f567...f166 | 0.00 | USD | Created |
| Fee | 1c57...15c1 | 0.00 | USD | Created |

These accounts are used internally by Cybrid for:
- **Reserve**: Holds customer funds
- **Gas**: Pays blockchain transaction fees
- **Fee**: Collects platform fees

## 🚀 Next Steps

1. **Update environment variables** with the correct GUIDs from your dashboard
2. **Retrieve your client secret** from Cybrid dashboard
3. **Run validation script** to confirm everything works
4. **Test end-to-end flow** with the sandbox test script
5. **Set up webhook secret** for production security

## 📞 Troubleshooting

### "Invalid client credentials" error
- Double-check your `CYBRID_CLIENT_ID` and `CYBRID_CLIENT_SECRET`
- Ensure you're using the **Bank Client ID**, not Organization Client ID
- Verify the secret hasn't expired or been regenerated

### "Bank not found" error
- Verify `CYBRID_BANK_GUID` matches your dashboard (b90128ef166ec0158c4a3627776600c8)
- Ensure your API key has access to the MyCora bank

### "Insufficient scope" error
- Check that your OAuth scope includes both organization and bank GUIDs
- Format: `organizations:{ORG_GUID} banks:{BANK_GUID}`

## 🔐 Security Best Practices

- ✅ Never commit `.env` files to version control
- ✅ Use different credentials for development/staging/production
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use webhook signature verification in production
- ✅ Monitor audit logs for suspicious activity
- ✅ Restrict API key permissions to minimum required scope
\`\`\`

\`\`\`json file="" isHidden
