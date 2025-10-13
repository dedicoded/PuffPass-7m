# Integration Setup Guide

This document provides a comprehensive guide to setting up all integrations for the PuffPass platform.

## Overview

The following integrations are configured:

1. **Neon Database** - PostgreSQL database (✅ Fully configured)
2. **Supabase** - Authentication and additional database features (⚠️ Needs environment variables)
3. **WalletConnect** - Web3 wallet connections (✅ Configured)
4. **Cybrid** - Banking and fiat on/off ramp (✅ Configured)
5. **Biconomy** - Gasless transactions (✅ Configured)
6. **Blockchain** - Smart contracts on Sepolia testnet (⚠️ Partial)

---

## 1. Neon Database

**Status**: ✅ Fully Configured

All Neon environment variables are set and the database is connected with 28 tables.

### Tables Available:
- User management: `users`, `user_profiles`
- Merchant system: `merchant_profiles`, `merchant_balances`, `merchant_fee_contributions`
- E-commerce: `products`, `orders`, `order_items`, `cart_items`
- Rewards: `puff_points`, `puff_transactions`, `rewards_catalog`, `reward_redemptions`
- Treasury: `puff_vault_balances`, `float_allocations`, `yield_generation`
- Compliance: `age_verification_logs`, `approval_workflows`
- Deployment tracking: `deployments`, `deployment_logs`, `deployment_metrics`, `deployment_alerts`

---

## 2. Supabase Integration

**Status**: ⚠️ Needs Environment Variables

### Required Environment Variables:

Add these to your Vercel project:

\`\`\`bash
SUPABASE_NEXT_PUBLIC_SUPABASE_URL="https://dgojhnhjplmeabirilvt.supaSUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnb2pobmhqcGxtZWFiaXJpbHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODI3OTIsImV4cCI6MjA3MTA1ODc5Mn0.7RachNJ6gS25hJia_bLI4nzqhJ2d5c0vbqswVSCaPAo"
\`\`\`

### Files Created:
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/middleware.ts` - Middleware session management

### Usage:

**Client Component:**
\`\`\`typescript
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
const { data, error } = await supabase.auth.signInWithPassword({ email, password })
\`\`\`

**Server Component:**
\`\`\`typescript
import { createClient } from "@/lib/supabase/server"

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
\`\`\`

---

## 3. WalletConnect Integration

**Status**: ✅ Configured

### Environment Variables Set:
\`\`\`bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="1c711e0584ef1a9b8f4e34aa99c21658"
\`\`\`

### Configuration File:
- `lib/integrations/walletconnect.ts`

### Usage:
\`\`\`typescript
import { walletConnectConfig, getWalletConnectProjectId } from "@/lib/integrations/walletconnect"

const projectId = getWalletConnectProjectId()
\`\`\`

---

## 4. Cybrid Banking Integration

**Status**: ✅ Configured

### Environment Variables Set:
\`\`\`bash
CYBRID_API_KEY="b90128ef166ec0158c4a3627776600c8"
\`\`\`

### Configuration File:
- `lib/integrations/cybrid.ts`

### Usage:
\`\`\`typescript
import { getCybridHeaders, isCybridConfigured } from "@/lib/integrations/cybrid"

if (isCybridConfigured()) {
  const headers = getCybridHeaders()
  // Make API calls to Cybrid
}
\`\`\`

### API Routes Using Cybrid:
- `app/api/cybrid/create-workflow/route.ts`
- `app/api/cybrid/create-bank-account/route.ts`

---

## 5. Biconomy Gasless Transactions

**Status**: ✅ Configured

### Environment Variables Set:
\`\`\`bash
BICONOMY_API_KEY="mee_S9mB4qRG8JhuEXr8psYhwj"
BICONOMY_PROJECT_ID="b0f7c067-3fd4-44fe-805c-5d25fb8c7186"
\`\`\`

### Configuration File:
- `lib/integrations/biconomy.ts`

### Usage:
\`\`\`typescript
import { getBiconomyConfig, isBiconomyConfigured } from "@/lib/integrations/biconomy"

if (isBiconomyConfigured()) {
  const config = getBiconomyConfig()
  // Initialize Biconomy SDK with config
}
\`\`\`

---

## 6. Blockchain Integration

**Status**: ⚠️ Partial Configuration

### Environment Variables Set:
\`\`\`bash
NEXT_PUBLIC_NETWORK="sepolia"
NEXT_PUBLIC_MCC_CONTRACT_ADDRESS="0x6C7Bb1AB0E3fa6a6CFf9bff3E2b4cC6ffffFffff"
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/0fe3b608c8f84bdcbf13ad12fb4110e1"
DEPLOYER_PRIVATE_KEY="52339752963a98b8fcec69770c760cd72d7de04ac38339404dc9cb7bab0d3f0b"
ETHERSCAN_API_KEY="S2J8RAWWXTBQKVHKD1UXB6RJNFUVRANU2R"
POLYGONSCAN_API_KEY="S2J8RAWWXTBQKVHKD1UXB6RJNFUVRANU2R"
\`\`\`

### Missing Contract Addresses:
The following contracts need to be deployed or configured:
- `NEXT_PUBLIC_COMPLIANCE_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_MERCHANT_PROCESSOR_ADDRESS`
- `NEXT_PUBLIC_SECURITY_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_PUFFPASS_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_UTILITY_CONTRACT_ADDRESS`

### Configuration Files:
- `lib/blockchain-config.ts` - Blockchain configuration
- `hardhat.config.ts` - Hardhat deployment configuration

---

## 7. Additional Integrations

### Mycora AppKit
\`\`\`bash
MYCORA_APPKIT_AUTH_API="5d9ed9ae-0116-460c-b943-6384940235ad"
\`\`\`

### Dashboard API
\`\`\`bash
DASHBOARD_API="981d3452-f08e-4f1e-b69e-3bc111f9c948"
\`\`\`

### Session Management
\`\`\`bash
SESSION_SECRET="0HhnEn8G92rApf1+TaDwlzOQHrzR8jm+ysWBVE7OOknpxmamijmHyk9JcsW6mRBnKEhJMZ4HVh0lxbuWgeNZYA=="
\`\`\`

---

## Next Steps

### Immediate Actions Required:

1. **Add Supabase Environment Variables** (Required for auth):
   \`\`\`bash
   NEXT_PUBLIC_SUPABASE_URL="https://dgojhnhjplmeabirilvt.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   \`\`\`

2. **Deploy Missing Smart Contracts** (Optional - for full blockchain features):
   - Compliance Contract
   - Merchant Processor Contract
   - Security Contract
   - PuffPass Contract
   - Utility Contract

3. **Test Integrations**:
   - Test wallet connection with WalletConnect
   - Test Supabase authentication
   - Test Cybrid banking features
   - Test gasless transactions with Biconomy

### Testing Commands:

\`\`\`bash
# Test database connection
npm run test:db

# Test all systems
npm run validate:all

# Run development server
npm run dev
\`\`\`

---

## Security Notes

1. **Never commit private keys** - The `DEPLOYER_PRIVATE_KEY` should only be used in secure environments
2. **Rotate API keys regularly** - Especially for production environments
3. **Use environment-specific keys** - Separate keys for development, staging, and production
4. **Enable Row Level Security (RLS)** - All Supabase tables should have RLS policies
5. **Monitor API usage** - Set up alerts for unusual activity

---

## Support

For integration-specific issues:
- **Neon**: https://neon.tech/docs
- **Supabase**: https://supabase.com/docs
- **WalletConnect**: https://docs.walletconnect.com
- **Cybrid**: https://docs.cybrid.xyz
- **Biconomy**: https://docs.biconomy.io
- **Hardhat**: https://hardhat.org/docs
