#!/bin/bash

echo "🚀 Deploying PuffPassRouter to Polygon Mainnet"
echo ""
echo "⚠️  WARNING: This is a MAINNET deployment using REAL funds!"
echo ""

# Check if DEPLOYER_PRIVATE_KEY is set
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
  echo "❌ Error: DEPLOYER_PRIVATE_KEY not set"
  exit 1
fi

# Check if Mumbai deployment was tested
if [ ! -f "deployments/mumbai-deployment.json" ]; then
  echo "❌ Error: No Mumbai deployment found"
  echo "Test on Mumbai first: ./scripts/deploy-mumbai.sh"
  exit 1
fi

echo "📋 Mainnet deployment checklist:"
echo "  - Chain ID: 137 (Polygon Mainnet)"
echo "  - USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
echo "  - You need at least 0.1 MATIC for gas"
echo ""

read -p "Have you tested thoroughly on Mumbai? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Test on Mumbai first!"
  exit 1
fi

read -p "Do you have at least 0.1 MATIC for gas? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Get MATIC first!"
  exit 1
fi

echo ""
read -p "Are you ABSOLUTELY sure you want to deploy to MAINNET? (type 'yes'): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Deployment cancelled."
  exit 0
fi

echo ""
echo "🔨 Deploying contract to Polygon mainnet..."
npx hardhat run scripts/deploy-polygon-router.ts --network polygon

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Mainnet deployment successful!"
  echo ""
  echo "📝 Critical next steps:"
  echo "1. BACKUP deployment info from deployments/polygon-deployment.json"
  echo "2. Verify contract on PolygonScan"
  echo "3. Update v0 production env var: NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS"
  echo "4. Test with small payment first ($1)"
  echo "5. Set up daily batch settlement cron"
else
  echo ""
  echo "❌ Deployment failed!"
  exit 1
fi
