# Testnet Integration Setup Guide

This guide will help you configure PuffPass to use real blockchain transactions on Sepolia testnet with test tokens (no real money required).

## Overview

Your system is currently in **simulation mode**. This guide will enable:
- ✅ Real wallet connections (MetaMask, WalletConnect, etc.)
- ✅ Real blockchain transactions on Sepolia testnet
- ✅ Real smart contract interactions
- ✅ Free test ETH from faucets
- ❌ NO real money involved

## Step 1: Get Required API Keys

### 1.1 WalletConnect Project ID (Required)
1. Go to https://cloud.walletconnect.com/
2. Sign up for a free account
3. Create a new project called "PuffPass"
4. Copy your Project ID
5. Add to `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id_here"
   \`\`\`

### 1.2 Alchemy or Infura RPC URL (Required)
Choose one provider:

**Option A: Alchemy (Recommended)**
1. Go to https://www.alchemy.com/
2. Sign up for free account
3. Create a new app on Sepolia network
4. Copy the HTTPS URL
5. Add to `.env.local`:
   \`\`\`env
   SEPOLIA_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
   \`\`\`

**Option B: Infura**
1. Go to https://infura.io/
2. Sign up for free account
3. Create new project
4. Copy Sepolia endpoint
5. Add to `.env.local`:
   \`\`\`env
   SEPOLIA_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
   \`\`\`

### 1.3 Get Test ETH (Free)
You need test ETH to pay for gas fees on Sepolia:

1. **Alchemy Sepolia Faucet**: https://sepoliafaucet.com/
2. **Infura Faucet**: https://www.infura.io/faucet/sepolia
3. **Chainlink Faucet**: https://faucets.chain.link/sepolia

You'll need a wallet address (MetaMask recommended).

## Step 2: Update Environment Variables

Create or update `.env.local` with these values:

\`\`\`env
# Enable testnet mode
NODE_ENV="development"
NEXT_PUBLIC_NETWORK="sepolia"

# WalletConnect (REQUIRED)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"

# Sepolia RPC (REQUIRED)
SEPOLIA_URL="your_alchemy_or_infura_sepolia_url"

# Optional: For deploying contracts
PRIVATE_KEY="your_wallet_private_key_for_deployment"

# Keep existing database and other configs
DATABASE_URL="your_existing_database_url"
# ... other existing variables
\`\`\`

## Step 3: Deploy Smart Contracts to Sepolia

Once you have test ETH and RPC configured:

\`\`\`bash
# Install dependencies
npm install

# Deploy contracts to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Copy the deployed contract addresses to .env.local
\`\`\`

Update `.env.local` with deployed addresses:
\`\`\`env
NEXT_PUBLIC_COMPLIANCE_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_MERCHANT_PROCESSOR_ADDRESS="0x..."
NEXT_PUBLIC_SECURITY_CONTRACT_ADDRESS="0x..."
\`\`\`

## Step 4: Test the Integration

1. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Connect your wallet**:
   - Go to http://localhost:3000/onramp
   - Click "Connect Wallet" (should appear with real WalletConnect)
   - Connect MetaMask or another wallet

3. **Make a test transaction**:
   - Select Cybrid or Sphere payment method
   - Enter a small amount ($1-5)
   - Complete the transaction
   - Check Sepolia Etherscan to verify: https://sepolia.etherscan.io/

## Step 5: Verify Blockchain Transactions

After making a payment, verify it on-chain:

1. Go to https://sepolia.etherscan.io/
2. Search for your wallet address or transaction hash
3. You should see the transaction recorded on the blockchain

## Safety Features

- ✅ All transactions use **test ETH** (no value)
- ✅ Sepolia testnet is **completely separate** from mainnet
- ✅ No real money can be lost
- ✅ Perfect for testing and development

## Troubleshooting

### "Demo project ID in use" warning
- You need to set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` with a real project ID from WalletConnect

### "Browser crypto APIs not available"
- Try a different browser (Chrome/Brave recommended)
- Check if you're using HTTPS or localhost

### "Insufficient funds for gas"
- Get more test ETH from faucets listed above
- Each transaction costs ~0.001-0.01 test ETH

### Transactions failing
- Check you're on Sepolia network in MetaMask
- Verify RPC URL is correct in `.env.local`
- Check contract addresses are deployed and correct

## Next Steps

Once testnet is working:
1. Test all payment flows thoroughly
2. Verify database records match blockchain transactions
3. Test error handling and edge cases
4. Consider security audit before mainnet deployment

## Production Deployment (Future)

⚠️ **DO NOT deploy to mainnet without**:
- Legal compliance review
- Professional security audit
- Insurance and legal protections
- Proper KYC/AML procedures
- Cannabis industry licensing

For production, you'll need to:
1. Switch `NEXT_PUBLIC_NETWORK="mainnet"`
2. Update RPC URLs to mainnet
3. Deploy contracts to mainnet (costs real ETH)
4. Configure production Cybrid/Sphere API keys
5. Implement full compliance measures
