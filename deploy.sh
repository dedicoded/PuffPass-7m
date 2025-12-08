#!/bin/bash

echo "🚀 PuffPass Polygon Deployment Script"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your POLYGON_PRIVATE_KEY"
    exit 1
fi

# Load environment variables
export $(cat .env.local | xargs)

# Ask which network
echo "Select deployment network:"
echo "1) Mumbai Testnet (recommended for testing)"
echo "2) Polygon Mainnet (production)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        export DEPLOY_NETWORK=mumbai
        echo "✅ Deploying to Mumbai Testnet..."
        ;;
    2)
        export DEPLOY_NETWORK=polygon
        echo "⚠️  WARNING: Deploying to Polygon Mainnet!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Cancelled."
            exit 0
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Compile contracts
echo ""
echo "📦 Compiling contracts..."
npx hardhat compile

# Run deployment
echo ""
npx tsx scripts/deploy-to-polygon.ts

echo ""
echo "✅ Deployment complete!"
