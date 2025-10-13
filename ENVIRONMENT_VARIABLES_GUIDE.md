# PuffPass Environment Variables Guide

This document provides a comprehensive guide to all environment variables required for the PuffPass platform.

## Already Configured (From Integrations)

These are automatically set by your connected integrations:

### Database (Neon)
- `DATABASE_URL` - PostgreSQL connection string (pooled)
- `POSTGRES_URL` - PostgreSQL connection string
- `POSTGRES_PRISMA_URL` - Prisma-compatible connection string
- `DATABASE_URL_UNPOOLED` - Direct database connection
- `POSTGRES_URL_NON_POOLING` - Non-pooled connection
- `POSTGRES_HOST` - Database host
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

### Redis (Upstash)
- `KV_URL` - Redis connection URL
- `KV_REST_API_URL` - Redis REST API URL
- `KV_REST_API_TOKEN` - Redis REST API token
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only token
- `REDIS_URL` - Alternative Redis URL

### Search (Upstash)
- `UPSTASH_SEARCH_REST_URL` - Search API URL
- `UPSTASH_SEARCH_REST_TOKEN` - Search API token
- `UPSTASH_SEARCH_REST_READONLY_TOKEN` - Read-only search token

### Storage (Vercel Blob)
- `BLOB_READ_WRITE_TOKEN` - Blob storage token

### Supabase (Alternative Auth/DB)
- `SUPABASE_POSTGRES_URL` - Supabase PostgreSQL URL
- `SUPABASE_SUPABASE_URL` - Supabase API URL
- `SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL
- `SUPABASE_SUPABASE_ANON_KEY` - Anonymous key
- `SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY` - Public anonymous key
- `SUPABASE_SUPABASE_SERVICE_ROLE_KEY` - Service role key

### Platform
- `NEXT_PUBLIC_VERCEL_URL` - Vercel deployment URL (auto-set)

---

## Required Configuration

### Authentication & Security

#### `SESSION_SECRET` (REQUIRED)
**Purpose:** Encrypts JWT tokens for user sessions  
**Format:** Random 32+ character string  
**Example:** `your-super-secret-session-key-min-32-chars`  
**Generate:** `openssl rand -base64 32`

#### `WALLET_GENERATION_SALT` (REQUIRED)
**Purpose:** Salt for deterministic wallet generation  
**Format:** Random 32+ character string  
**Example:** `your-wallet-salt-min-32-chars-random`  
**Generate:** `openssl rand -base64 32`

#### `NEXT_PUBLIC_ADMIN_TRUSTEE_WALLET` (REQUIRED)
**Purpose:** Admin wallet address for platform governance  
**Format:** Ethereum address (0x...)  
**Example:** `0xBBB5e36A40EB48d1F2f534eE3D50c11748C243Be`  
**Note:** This is the wallet address that gets admin privileges

#### `TRUSTED_WALLETS` (OPTIONAL)
**Purpose:** Comma-separated list of trusted wallet addresses  
**Format:** `0xAddress1,0xAddress2,0xAddress3`  
**Example:** `0xBBB5e36A40EB48d1F2f534eE3D50c11748C243Be,0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

---

### Blockchain Configuration

#### `NEXT_PUBLIC_CHAIN_ID` (REQUIRED)
**Purpose:** Blockchain network ID  
**Options:**
- `11155111` - Sepolia testnet (recommended for testing)
- `1` - Ethereum mainnet
- `137` - Polygon mainnet
**Example:** `11155111`

#### `RPC_URL` (REQUIRED)
**Purpose:** Blockchain RPC endpoint  
**Example:** `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`  
**Providers:** Infura, Alchemy, QuickNode

#### `SEPOLIA_URL` (REQUIRED for testnet)
**Purpose:** Sepolia testnet RPC URL  
**Example:** `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`

#### `POLYGON_URL` (OPTIONAL)
**Purpose:** Polygon network RPC URL  
**Example:** `https://polygon-rpc.com`

#### `DEPLOYER_PRIVATE_KEY` (REQUIRED for contract deployment)
**Purpose:** Private key for deploying smart contracts  
**Format:** 64 hex characters (without 0x prefix)  
**Security:** NEVER expose this in NEXT_PUBLIC_ variables  
**Note:** Only needed for initial contract deployment

---

### Smart Contract Addresses

Deploy your contracts first, then add these addresses:

#### `NEXT_PUBLIC_CONTRACT_ADDRESS` (REQUIRED)
**Purpose:** Main PuffPass contract address  
**Format:** `0x...` (42 characters)

#### `NEXT_PUBLIC_PUFFPASS_CONTRACT_ADDRESS` (REQUIRED)
**Purpose:** PuffPass token contract  
**Format:** `0x...`

#### `NEXT_PUBLIC_COMPLIANCE_CONTRACT_ADDRESS` (REQUIRED)
**Purpose:** Compliance verification contract  
**Format:** `0x...`

#### `NEXT_PUBLIC_MCC_CONTRACT_ADDRESS` (REQUIRED)
**Purpose:** Merchant Category Code contract  
**Format:** `0x...`

#### `NEXT_PUBLIC_MERCHANT_PROCESSOR_ADDRESS` (REQUIRED)
**Purpose:** Merchant payment processor contract  
**Format:** `0x...`

#### `NEXT_PUBLIC_SECURITY_CONTRACT_ADDRESS` (REQUIRED)
**Purpose:** Security and access control contract  
**Format:** `0x...`

#### `NEXT_PUBLIC_UTILITY_CONTRACT_ADDRESS` (REQUIRED)
**Purpose:** Utility functions contract  
**Format:** `0x...`

---

### Payment Providers

#### Cybrid (Banking & Fiat)

##### `CYBRID_API_URL` (REQUIRED)
**Purpose:** Cybrid API endpoint  
**Sandbox:** `https://bank.sandbox.cybrid.app`  
**Production:** `https://bank.cybrid.app`

##### `CYBRID_ORG_GUID` (REQUIRED)
**Purpose:** Your Cybrid organization ID  
**Format:** UUID  
**Get from:** Cybrid dashboard

##### `CYBRID_BANK_GUID` (REQUIRED)
**Purpose:** Your Cybrid bank ID  
**Format:** UUID  
**Get from:** Cybrid dashboard

##### `CYBRID_CLIENT_ID` (REQUIRED)
**Purpose:** Cybrid OAuth client ID  
**Get from:** Cybrid dashboard

##### `CYBRID_CLIENT_SECRET` (REQUIRED)
**Purpose:** Cybrid OAuth client secret  
**Get from:** Cybrid dashboard  
**Security:** Keep secret, server-side only

##### `CYBRID_WEBHOOK_SECRET` (REQUIRED)
**Purpose:** Validates Cybrid webhook signatures  
**Get from:** Cybrid dashboard

#### Sphere (Crypto Payments)

##### `SPHERE_API_URL` (REQUIRED)
**Purpose:** Sphere API endpoint  
**Sandbox:** `https://api.sandbox.spherepay.co`  
**Production:** `https://api.spherepay.co`

##### `SPHERE_API_KEY` (REQUIRED)
**Purpose:** Sphere API authentication key  
**Get from:** Sphere dashboard  
**Security:** Keep secret, server-side only

---

### WalletConnect

#### `REOWN_PROJECT_ID` (REQUIRED)
**Purpose:** WalletConnect/Reown project ID  
**Get from:** https://cloud.walletconnect.com  
**Format:** UUID  
**Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

### Email (SendGrid)

#### `SENDGRID_API_KEY` (OPTIONAL)
**Purpose:** Send transactional emails  
**Get from:** SendGrid dashboard  
**Format:** `SG.xxxxxxxxxxxxx`  
**Use cases:** Order confirmations, password resets

---

### Image Storage (Cloudinary)

#### `CLOUDINARY_CLOUD_NAME` (OPTIONAL)
**Purpose:** Cloudinary account name  
**Get from:** Cloudinary dashboard

#### `CLOUDINARY_API_KEY` (OPTIONAL)
**Purpose:** Cloudinary API key  
**Get from:** Cloudinary dashboard

#### `CLOUDINARY_API_SECRET` (OPTIONAL)
**Purpose:** Cloudinary API secret  
**Get from:** Cloudinary dashboard  
**Security:** Keep secret, server-side only

---

### Application Configuration

#### `NEXT_PUBLIC_APP_URL` (REQUIRED)
**Purpose:** Your application's public URL  
**Development:** `http://localhost:3000`  
**Production:** `https://puffpass.vercel.app`

#### `NEXT_PUBLIC_ENABLE_REAL_TRANSACTIONS` (REQUIRED)
**Purpose:** Enable real blockchain transactions  
**Options:**
- `false` - Demo mode (recommended for testing)
- `true` - Real transactions (production only)

---

### Badge System (Optional)

#### `BADGE_ISSUER_PRIVATE_KEY` (OPTIONAL)
**Purpose:** Private key for issuing achievement badges  
**Format:** 64 hex characters  
**Security:** Keep secret, server-side only

---

### SMTP (Optional Email Server)

#### `SMTP_PASS` (OPTIONAL)
**Purpose:** SMTP server password for custom email  
**Alternative to:** SendGrid  
**Use if:** You have your own email server

---

## Environment Variable Priority

1. **Critical (Must set immediately):**
   - `SESSION_SECRET`
   - `WALLET_GENERATION_SALT`
   - `NEXT_PUBLIC_ADMIN_TRUSTEE_WALLET`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `RPC_URL`
   - `REOWN_PROJECT_ID`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_ENABLE_REAL_TRANSACTIONS`

2. **Deploy Contracts Then Set:**
   - All `NEXT_PUBLIC_*_CONTRACT_ADDRESS` variables

3. **Payment Integration (Choose one or both):**
   - Cybrid variables (for fiat/banking)
   - Sphere variables (for crypto)

4. **Optional Enhancements:**
   - SendGrid (emails)
   - Cloudinary (image hosting)
   - Badge issuer (gamification)

---

## Quick Start Values

For immediate testing, use these values:

\`\`\`bash
# Security (GENERATE YOUR OWN!)
SESSION_SECRET="your-super-secret-session-key-min-32-chars"
WALLET_GENERATION_SALT="your-wallet-salt-min-32-chars-random"

# Admin
NEXT_PUBLIC_ADMIN_TRUSTEE_WALLET="0xBBB5e36A40EB48d1F2f534eE3D50c11748C243Be"

# Blockchain (Sepolia Testnet)
NEXT_PUBLIC_CHAIN_ID="11155111"
RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
SEPOLIA_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"

# WalletConnect
REOWN_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ENABLE_REAL_TRANSACTIONS="false"
\`\`\`

---

## Security Best Practices

1. **Never commit secrets to git**
2. **Use different values for dev/staging/production**
3. **Rotate secrets regularly (every 90 days)**
4. **Never use NEXT_PUBLIC_ for private keys or secrets**
5. **Use strong random values for SESSION_SECRET and WALLET_GENERATION_SALT**
6. **Keep DEPLOYER_PRIVATE_KEY in a secure vault**

---

## Getting API Keys

### Infura (RPC)
1. Go to https://infura.io
2. Create account
3. Create new project
4. Copy API key
5. Use: `https://sepolia.infura.io/v3/YOUR_KEY`

### WalletConnect/Reown
1. Go to https://cloud.walletconnect.com
2. Create account
3. Create new project
4. Copy Project ID

### Cybrid
1. Go to https://www.cybrid.xyz
2. Request sandbox access
3. Get credentials from dashboard

### Sphere
1. Go to https://spherepay.co
2. Request API access
3. Get credentials from dashboard

### SendGrid
1. Go to https://sendgrid.com
2. Create account
3. Create API key in Settings > API Keys

### Cloudinary
1. Go to https://cloudinary.com
2. Create account
3. Get credentials from dashboard

---

## Deployment Checklist

- [ ] Generate SESSION_SECRET
- [ ] Generate WALLET_GENERATION_SALT
- [ ] Set NEXT_PUBLIC_ADMIN_TRUSTEE_WALLET
- [ ] Get Infura/Alchemy RPC URL
- [ ] Get WalletConnect Project ID
- [ ] Deploy smart contracts
- [ ] Set all contract addresses
- [ ] Configure payment provider (Cybrid or Sphere)
- [ ] Set NEXT_PUBLIC_APP_URL to production URL
- [ ] Set NEXT_PUBLIC_ENABLE_REAL_TRANSACTIONS to "false" initially
- [ ] Test all functionality
- [ ] Enable real transactions when ready

---

## Need Help?

- Check the deployment-info.json for project details
- Review the README.md for setup instructions
- Contact support if you need assistance with integrations
