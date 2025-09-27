# 🌿 MyCora Cannabis Platform

A comprehensive cannabis marketplace platform built with Next.js, TypeScript, and blockchain integration.

## 🚀 Features

- **Multi-Role System**: Cannabis Customers, Merchants, and Platform Admins
- **Product Management**: Comprehensive cannabis product catalog
- **Order Processing**: Complete order management system
- **Blockchain Integration**: Smart contracts for secure transactions
- **Age Verification**: Compliant age verification system
- **Admin Dashboard**: Comprehensive platform administration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Blockchain**: Hardhat, TypeChain, Ethers.js
- **Authentication**: Stack Auth
- **Deployment**: Vercel

## 📦 Installation

### Quick Start
\`\`\`bash
chmod +x install.sh
./install.sh
\`\`\`

### Manual Installation
\`\`\`bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local

# Setup Git hooks
pnpm husky install

# Start development server
pnpm dev
\`\`\`

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and update with your values:

\`\`\`env
# Database
DATABASE_URL="your-neon-database-url"

# Authentication
NEXT_PUBLIC_STACK_PROJECT_ID="your-stack-project-id"
STACK_SECRET_SERVER_KEY="your-stack-secret-key"

# Blockchain (optional)
SEPOLIA_URL="your-sepolia-rpc-url"
PRIVATE_KEY="your-private-key"
\`\`\`

## 🏗️ Development

\`\`\`bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Run CLI tools
pnpm cli

# Compile smart contracts
pnpm hardhat compile
\`\`\`

## 📁 Project Structure

\`\`\`
├── app/                 # Next.js app directory
├── components/          # React components
├── contracts/           # Smart contracts
├── scripts/             # CLI and build scripts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── .husky/             # Git hooks
└── deployments/        # Deployment configurations
\`\`\`

## 🌿 Cannabis Compliance

This platform includes built-in compliance features:
- Age verification system
- Product categorization
- Regulatory compliance tracking
- Secure transaction processing

## 🚀 Deployment

### Vercel (Recommended)
\`\`\`bash
pnpm deploy:vercel
\`\`\`

### Docker
\`\`\`bash
docker-compose up -d
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue or contact the development team.

---

**MyCora** - Empowering the cannabis industry with technology 🌿
