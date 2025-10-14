# Integration Setup Guide

## Required Environment Variables

This guide lists all environment variables that need to be configured for PuffPass to work properly.

### ✅ Already Configured (via v0 Integrations)
- `DATABASE_URL` - Neon database connection
- `SUPABASE_*` - Supabase configuration
- `KV_*` - Upstash Redis configuration
- `UPSTASH_SEARCH_*` - Upstash Search configuration
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage

### ⚠️ Missing - Add These to Vercel Project

#### 1. Authentication & Security (CRITICAL)
\`\`\`bash
# Generate a secure JWT secret (32+ characters)
JWT_SECRET="your-secure-jwt-secret-here"

# For JWT rotation (initially same as JWT_SECRET)
JWT_SECRET_PREVIOUS="your-previous-jwt-secret"

# Comma-separated list of trusted admin wallet addresses
TRUSTED_WALLETS="0xBBB5e36A40EB48d1F2f534eE3D50c11748C243Be"
\`\`\`

#### 2. Cybrid Banking Integration (REQUIRED for payments)
\`\`\`bash
# Get these from Cybrid Dashboard: https://dashboard.cybrid.app
CYBRID_CLIENT_SECRET="your_client_secret_from_cybrid_dashboard"
CYBRID_WEBHOOK_SECRET="generate_random_32_char_string"

# Already configured in .env.example:
# CYBRID_API_URL="https://bank.sandbox.cybrid.app"
# CYBRID_ORG_GUID="e658f582bfe3d7fcc8f6985ab918dad9"
# CYBRID_BANK_GUID="b90128ef166ec0158c4a3627776600c8"
# CYBRID_CLIENT_ID="HRGTSnmLPzTnzx_JdMFGSi8DC6wvG1K6r8ngCi3b4rM"
\`\`\`

#### 3. Sphere Payments (REQUIRED for crypto payments)
\`\`\`bash
SPHERE_API_KEY="your-sphere-api-key"
SPHERE_API_URL="https://api.sphere.com"
\`\`\`

#### 4. WalletConnect (REQUIRED for production Web3)
\`\`\`bash
# Get from: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_real_project_id"

# Currently using demo ID: "1c711e0584ef1a9b8f4e34aa99c21658"
\`\`\`

#### 5. Smart Contract Deployment (REQUIRED for blockchain features)
\`\`\`bash
# Private key for deploying contracts (keep secure!)
DEPLOYER_PRIVATE_KEY="your_deployer_private_key_here"
\`\`\`

#### 6. Email Notifications (OPTIONAL but recommended)
\`\`\`bash
# Get from: https://sendgrid.com
SENDGRID_API_KEY="SG.your_sendgrid_api_key"
\`\`\`

#### 7. Gasless Transactions (OPTIONAL)
\`\`\`bash
# Get from: https://biconomy.io
BICONOMY_API_KEY="your_biconomy_api_key"
BICONOMY_PROJECT_ID="your_biconomy_project_id"
\`\`\`

## How to Add Environment Variables

### Via Vercel Dashboard
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with its value
4. Select environments (Production, Preview, Development)
5. Save and redeploy

### Via v0 Interface
1. Click the "Vars" section in the left sidebar
2. Add each missing environment variable
3. Values will be automatically synced to Vercel

## Security Best Practices

1. **Never commit secrets to Git** - Use environment variables only
2. **Rotate JWT secrets regularly** - Use the JWT rotation scripts
3. **Use different keys for dev/staging/production**
4. **Keep DEPLOYER_PRIVATE_KEY secure** - This controls your smart contracts
5. **Enable webhook signature verification** - Set CYBRID_WEBHOOK_SECRET

## Verification

After adding environment variables, run:
\`\`\`bash
pnpm run validate:env
\`\`\`

Or check the integration status:
\`\`\`bash
curl https://your-app.vercel.app/api/web3/health
\`\`\`

## Documentation References

- Cybrid Setup: `docs/CYBRID_INTEGRATION.md`
- JWT Rotation: `docs/SYSTEM_VALIDATION.md`
- Environment Variables: `ENVIRONMENT_VARIABLES_GUIDE.md`
- Testnet Setup: `docs/TESTNET_SETUP.md`
