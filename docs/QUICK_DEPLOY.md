# Quick Deployment Guide

## Prerequisites

1. **Get MATIC tokens**
   - Mumbai: Get free testnet MATIC from https://faucet.polygon.technology/
   - Mainnet: Buy MATIC on an exchange and transfer to your wallet

2. **Set up environment variables**
   
Create `.env.local`:
\`\`\`env
POLYGON_PRIVATE_KEY=your_private_key_here
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
POLYGON_RPC_URL=https://polygon-rpc.com
\`\`\`

## Deploy to Mumbai (Testnet)

\`\`\`bash
# 1. Make script executable
chmod +x deploy.sh

# 2. Run deployment
./deploy.sh

# 3. Select option 1 (Mumbai Testnet)

# 4. Copy the contract address and add to .env.local:
NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS=0xYourContractAddress
\`\`\`

## Deploy to Mainnet

\`\`\`bash
# Same steps but select option 2 (Polygon Mainnet)
./deploy.sh
\`\`\`

## After Deployment

1. **Verify contract on Polygonscan**
   \`\`\`bash
   npx hardhat verify --network polygon YOUR_CONTRACT_ADDRESS "USDC_ADDRESS" "TREASURY_ADDRESS"
   \`\`\`

2. **Test the payment flow**
   - Go to `/onramp`
   - Enter amount
   - Click "Pay with USDC"
   - Confirm transaction in MetaMask

3. **Monitor transactions**
   - Check Polygonscan for contract activity
   - View treasury balance
   - Track merchant payouts

## Troubleshooting

**"Insufficient balance"**
- Add more MATIC to your deployer wallet

**"Network error"**
- Check your RPC URL in .env.local
- Try alternative RPC: https://polygon.llamarpc.com

**"Contract already deployed"**
- You can deploy multiple times (each gets a new address)
- Update NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS with the latest

## Gas Costs

- Mumbai: ~0.01 MATIC (free testnet)
- Mainnet: ~0.05-0.10 MATIC (~$0.05-$0.10 USD)
