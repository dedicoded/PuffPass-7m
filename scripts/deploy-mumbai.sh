#!/bin/bash

echo "🚀 Deploying PuffPassRouter to Polygon Mumbai Testnet"
echo ""

# Check if DEPLOYER_PRIVATE_KEY is set
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
  echo "❌ Error: DEPLOYER_PRIVATE_KEY not set"
  echo "Set it in your .env file or export it:"
  echo "export DEPLOYER_PRIVATE_KEY=your_key_here"
  exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "  - Using Mumbai testnet (Chain ID: 80001)"
echo "  - USDC: 0x62359Ed7505Efc61FF1D56fEF82158CcaffA23D7"
echo ""

read -p "Do you have test MATIC in your wallet? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Get test MATIC from: https://faucet.polygon.technology/"
  exit 1
fi

echo ""
echo "🔨 Deploying contract..."
npx hardhat run scripts/deploy-polygon-router.ts --network mumbai

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployment successful!"
  echo ""
  echo "📝 Next steps:"
  echo "1. Run tests: npx hardhat run scripts/test-mumbai-deployment.ts --network mumbai"
  echo "2. View on Mumbai PolygonScan: https://mumbai.polygonscan.com/address/[CONTRACT_ADDRESS]"
  echo "3. Update v0 env var: NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS"
else
  echo ""
  echo "❌ Deployment failed. Check the error above."
  exit 1
fi
