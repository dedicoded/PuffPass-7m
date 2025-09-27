#!/bin/bash

echo "🌿 Installing MyCora Cannabis Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup environment variables
if [ ! -f .env.local ]; then
    echo "🔧 Setting up environment variables..."
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
    echo "⚠️  Please update .env.local with your actual values"
fi

# Setup Husky hooks
echo "🪝 Setting up Git hooks..."
pnpm husky install

# Build TypeChain types if contracts exist
if [ -d "contracts" ]; then
    echo "🔗 Generating TypeChain types..."
    pnpm hardhat compile
fi

# Run initial build
echo "🏗️  Running initial build..."
pnpm build

echo "✅ MyCora Cannabis Platform installation complete!"
echo ""
echo "🚀 To start development:"
echo "   pnpm dev"
echo ""
echo "📚 To view documentation:"
echo "   Open README.md"
echo ""
echo "🌿 Welcome to MyCora - Your Cannabis Platform!"
