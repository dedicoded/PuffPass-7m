# PuffPass Polygon Deployment Guide

Complete guide for deploying PuffPassRouter to Polygon Mumbai (testnet) and Polygon mainnet.

## Prerequisites

1. **Private Key**: Your deployer wallet private key
2. **MATIC tokens**: 
   - Mumbai: Get free test MATIC from [Mumbai Faucet](https://faucet.polygon.technology/)
   - Polygon: Real MATIC for gas fees (~0.1 MATIC should be enough)
3. **RPC URLs**: Polygon node access (provided in config)
4. **PolygonScan API Key**: For contract verification (optional but recommended)

## Environment Variables

Add these to your `.env` file or v0 Vars section:

\`\`\`bash
# Required
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Optional (defaults provided)
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
TREASURY_ADDRESS=your_treasury_address (defaults to deployer)
\`\`\`

## Step 1: Test Deployment on Mumbai Testnet

### 1.1 Get Test MATIC
Visit [Mumbai Faucet](https://faucet.polygon.technology/) and get test MATIC tokens.

### 1.2 Deploy to Mumbai
\`\`\`bash
npx hardhat run scripts/deploy-polygon-router.ts --network mumbai
\`\`\`

### 1.3 Verify Deployment
\`\`\`bash
# Check the contract on Mumbai PolygonScan
# URL will be: https://mumbai.polygonscan.com/address/[CONTRACT_ADDRESS]
\`\`\`

### 1.4 Test the Contract
\`\`\`bash
# Run integration tests on Mumbai
npx hardhat run scripts/test-mumbai-deployment.ts --network mumbai
\`\`\`

## Step 2: Production Deployment on Polygon Mainnet

### 2.1 Final Checklist
- [ ] Contract tested thoroughly on Mumbai
- [ ] Deployer wallet has at least 0.1 MATIC
- [ ] Treasury address configured correctly
- [ ] Private key secured (never commit to git)
- [ ] Backup of deployment info location ready

### 2.2 Deploy to Polygon Mainnet
\`\`\`bash
# Double-check network
npx hardhat run scripts/deploy-polygon-router.ts --network polygon
\`\`\`

### 2.3 Verify Contract on PolygonScan
\`\`\`bash
npx hardhat verify --network polygon [CONTRACT_ADDRESS] [USDC_ADDRESS] [TREASURY_ADDRESS]
\`\`\`

### 2.4 Save Deployment Info
The script automatically saves deployment info to:
\`\`\`
deployments/polygon-deployment.json
deployments/mumbai-deployment.json
\`\`\`

## Step 3: Configure v0 Application

### 3.1 Add Environment Variable
In v0 Vars section, add:
\`\`\`
NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS=[YOUR_DEPLOYED_CONTRACT_ADDRESS]
\`\`\`

### 3.2 For Batch Settlement
Add backend environment variables:
\`\`\`
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_PRIVATE_KEY=[ADMIN_PRIVATE_KEY_FOR_SETTLEMENTS]
PUFFPASS_ROUTER_ADDRESS=[YOUR_DEPLOYED_CONTRACT_ADDRESS]
\`\`\`

## Network Information

### Mumbai Testnet
- **Chain ID**: 80001
- **USDC Address**: `0x62359Ed7505Efc61FF1D56fEF82158CcaffA23D7`
- **RPC URL**: https://rpc-mumbai.maticvigil.com
- **Block Explorer**: https://mumbai.polygonscan.com

### Polygon Mainnet
- **Chain ID**: 137
- **USDC Address**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **RPC URL**: https://polygon-rpc.com
- **Block Explorer**: https://polygonscan.com

## Contract Features

### Fee Structure
- **Incoming Fee**: 3% on all payments (automatic)
- **Treasury**: Receives 3% fee immediately
- **Merchant Vault**: Credited with net amount (97%)
- **Batch Settlement**: Daily gasless payouts to merchants

### Key Functions
- `pay(merchant, amount)`: Process payment with 3% fee
- `batchSettle(merchants[], amounts[])`: Admin batch payout
- `getMerchantBalance(merchant)`: Check vault balance
- `updateTreasury(newTreasury)`: Change treasury address
- `emergencyDrain()`: Emergency fund recovery

## Security Notes

1. **Private Keys**: Never commit private keys to version control
2. **Owner Role**: The deployer address becomes the contract owner
3. **Treasury**: Can be updated by owner if needed
4. **Batch Settlement**: Only owner can execute settlements
5. **Emergency Drain**: Owner-only safety function

## Troubleshooting

### Deployment Fails
- Check MATIC balance (need ~0.01 MATIC for gas)
- Verify RPC URL is accessible
- Ensure private key format is correct (no 0x prefix needed)

### Contract Verification Fails
- Wait 1-2 minutes after deployment
- Ensure PolygonScan API key is valid
- Check constructor arguments match deployment

### Payment Fails in App
- Verify environment variable is set correctly
- Check user has USDC allowance approved
- Ensure user is on Polygon network
- Confirm user has enough USDC + gas

## Next Steps

After deployment:
1. Update v0 environment variables
2. Test payment flow with small amount
3. Monitor first few transactions
4. Set up daily batch settlement cron job
5. Configure monitoring and alerts

## Support

If you encounter issues:
1. Check deployment logs in `deployments/` folder
2. Verify contract on PolygonScan
3. Test with Mumbai testnet first
4. Review Hardhat documentation
