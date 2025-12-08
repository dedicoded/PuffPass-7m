# 🌿 MyCora Cannabis Platform

A comprehensive cannabis marketplace platform built with Next.js, TypeScript, and blockchain integration.

## 🚀 Features

- **Multi-Role System**: Cannabis Customers, Merchants, and Platform Admins
- **Product Management**: Comprehensive cannabis product catalog
- **Order Processing**: Complete order management system
- **Blockchain Integration**: Smart contracts for secure transactions
- **Age Verification**: Compliant age verification system with audit logging
- **Admin Dashboard**: Comprehensive platform administration with compliance monitoring
- **V0-Safe Migrations**: Zero-downtime database migrations with automatic validation
- **Automated Compliance**: Monthly compliance reports with multi-org support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Blockchain**: Hardhat, TypeChain, Ethers.js
- **Authentication**: Stack Auth
- **Payment Processing**: XAIGATE (USDC on Solana)
- **Deployment**: Vercel

## 🏗️ Payment Architecture

┌─────────────────────────────────────────────────────────────────┐
│                    MyCora Cannabis Platform                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 Customer                    🏪 Merchant                     │
│     │                              │                           │
│     ├─ Browse Products             ├─ Manage Inventory         │
│     ├─ Add to Cart                 ├─ Process Orders           │
│     └─ Checkout                    └─ View Analytics           │
│         │                              │                       │
│         └──────────┬───────────────────┘                       │
│                    │                                           │
│         ┌──────────▼──────────┐                                │
│         │   Order Processing   │                                │
│         │   (Smart Contracts)  │                                │
│         └──────────┬──────────┘                                │
│                    │                                           │
│    ┌───────────────▼───────────────┐                           │
│    │      Payment Processing       │                           │
│    │                               │                           │
│    │  🔗 XAIGATE (Self-Hosted)    │                           │
│    │                               │                           │
│    │  ├─ USDC on Solana (~5s)     │                           │
│    │  ├─ QR Code Payments         │                           │
│    │  ├─ Real-time Webhooks       │                           │
│    │  └─ POS & Online Checkout    │                           │
│    └───────────────┬───────────────┘                           │
│                    │                                           │
│         ┌──────────▼──────────┐                                │
│         │   Blockchain Layer   │                                │
│         │   (Solana Mainnet)   │                                │
│         └─────────────────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

🚀 XAIGATE - Open-Source, Self-Hosted Crypto Payments

**Key Payment Flow:**
1. **Customer Checkout** → XAIGATE generates payment request
2. **QR Code Display** → Customer scans with any Solana wallet
3. **USDC Transfer** → Fast (~5 seconds), low-fee (~$0.00025) payment
4. **Webhook Confirmation** → Automatic order fulfillment
5. **Merchant Settlement** → Direct USDC to merchant wallet

### 🔮 Future-Ready Extensions

┌─────────────────────────────────────────────────────────────────┐
│                 Modular Payment Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Customer Checkout                            │
│                           │                                     │
│                           ▼                                     │
│                   PuffPass Core App                             │
│                           │                                     │
│           ┌───────────────┼───────────────┐                     │
│           │               │               │                     │
│           ▼               ▼               ▼                     │
│                                                                 │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│    │ Crypto Rails│ │Multi-Chain  │ │Compliance   │              │
│    │             │ │Support      │ │Providers    │              │
│    │ ✅ XAIGATE  │ │ ✅ Solana   │ │ 🔌 Chainalysis│            │
│    │ 🔌 Circle   │ │ 🔌 Polygon  │ │ 🔌 Elliptic │              │
│    │ 🔌 Coinbase │ │ 🔌 Base     │ │ 🔌 TRM Labs │              │
│    └─────────────┘ └─────────────┘ └─────────────┘              │
│           │               │               │                     │
│           └───────────────┼───────────────┘                     │
│                           │                                     │
│                           ▼                                     │
│                                                                 │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │              Stablecoin Support                         │  │
│    │                                                         │  │
│    │  ✅ USDC         🔌 USDT       🔌 DAI                  │  │
│    │  ✅ Current      🔌 Future     🔌 Future               │  │
│    │                                                         │  │
│    │  🔌 CBDCs (Future) - Central Bank Digital Currencies   │  │
│    └─────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│                                                                 │
│         ┌─────────────────────────────────────────┐             │
│         │        Blockchain Settlement            │             │
│         │                                         │             │
│         │  ✅ Solana      🔌 Polygon    🔌 Base   │             │
│         │  🔌 Ethereum    🔌 Arbitrum   🔌 Optimism│            │
│         └─────────────────────────────────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legend: ✅ Currently Active  🔌 Future Extension Points

**Why This Architecture Matters:**

- **For Investors**: Shows clear expansion path without architectural rewrites
- **For Regulators**: Demonstrates compliance-first design with audit trails
- **For Contributors**: Modular design makes adding new providers straightforward
- **For Merchants**: Future-proof platform that can adapt to regulatory changes

**Extension Strategy:**
- **Phase 1**: XAIGATE + Solana USDC (Current)
- **Phase 2**: Additional stablecoins (USDT, DAI)
- **Phase 3**: Multi-chain support (Polygon, Base, Arbitrum)
- **Phase 4**: CBDC integration when available
- **Phase 5**: Enhanced compliance providers (Chainalysis, Elliptic)

📋 **Detailed Roadmap**: See [docs/ROADMAP.md](docs/ROADMAP.md) for comprehensive phased expansion plan, technical specifications, and investment/regulatory benefits.

## 💳 Payment Processing

**Current**: This platform uses **XAIGATE** for all crypto payment processing.

### Why XAIGATE?
- **Self-Hosted**: Full control over payment infrastructure
- **Open Source**: Transparent, auditable payment processing
- **Fast**: ~5 second confirmations on Solana
- **Low Fees**: ~$0.00025 per transaction
- **Compliant**: Built-in compliance features for cannabis industry

### For Contributors
- All payment-related code uses XAIGATE APIs
- Payment flows are handled through `/checkout` and POS interfaces
- USDC on Solana is the primary payment method
- Webhook system handles payment confirmations

### For Auditors
- Payment processing is fully compliant with crypto transaction standards
- All financial flows are traceable through Solana blockchain
- Self-hosted infrastructure ensures data sovereignty

## 🛡️ V0-Safe Migration System

This platform includes a production-ready migration safety system that prevents common v0 errors:

### Quick Start
\`\`\`bash
# Safely apply any v0-suggested SQL
pnpm migrate:v0safe "CREATE TABLE users (...);" table-name

# Validate all migrations before deployment
pnpm migrate:validate

# Generate monthly compliance report
pnpm compliance:report

# Multi-org compliance reports
pnpm compliance:multi-org
\`\`\`

### Features
- **Automatic SQL rewriting** into idempotent form (IF NOT EXISTS, CREATE OR REPLACE)
- **Dry-run validation** before applying changes
- **Timestamped audit trail** of all schema changes
- **Graceful error handling** for compliance reports
- **Multi-org support** for scaling across jurisdictions

📚 **Full Documentation**: See [docs/v0-safe-workflow.md](docs/v0-safe-workflow.md)

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

# Payment Processing (XAIGATE)
XAIGATE_API_URL="http://localhost:3001"
XAIGATE_API_KEY="your-xaigate-api-key"
XAIGATE_WEBHOOK_SECRET="your-webhook-secret"
XAIGATE_MERCHANT_WALLET="your-solana-wallet-address"

# Email (optional - for automated compliance reports)
SENDGRID_API_KEY="your-sendgrid-api-key"
\`\`\`

## 🏗️ Development

\`\`\`bash
# Start development server
pnpm dev

# Build for production (includes migration validation)
pnpm build

# Run linting
pnpm lint

# Run CLI tools
pnpm cli

# Compile smart contracts
pnpm hardhat compile

# Database migrations
pnpm migrate:v0safe "SQL HERE" migration-name
pnpm migrate:validate

# Compliance reporting
pnpm compliance:report
pnpm compliance:multi-org
\`\`\`

## 📁 Project Structure

\`\`\`
├── app/                 # Next.js app directory
├── components/          # React components
│   └── admin/          # Admin dashboard components
├── contracts/           # Smart contracts
├── scripts/             # CLI and build scripts
│   ├── v0SafeWrapper.js              # Safe migration wrapper
│   ├── reportGuardrailEmail.js       # Compliance reporting
│   └── multiOrgReportGuardrail.js    # Multi-org reports
├── migrations/          # Timestamped SQL migrations
├── reports/            # Generated compliance reports
├── docs/               # Documentation
│   ├── v0-safe-workflow.md          # Migration & compliance guide
│   ├── migration-guardrails.md      # Migration best practices
│   └── deployment-safety.md         # Deployment guidelines
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── .husky/             # Git hooks
└── deployments/        # Deployment configurations
\`\`\`

## 📊 Compliance & Auditing

This platform includes comprehensive compliance features:

### Age Verification
- Real-time age verification with multiple provider support
- Complete audit logging of all verification attempts
- Admin dashboard for monitoring pass/fail rates
- Suspicious activity detection and alerting

### Compliance Reporting
- Automated monthly compliance reports
- Multi-organization support for scaling
- Email delivery to regulators (optional)
- 90-day artifact retention in GitHub Actions
- CSV export for regulatory submissions

### Migration Safety
- All database changes validated before deployment
- Timestamped audit trail in `migrations/` folder
- Build-time validation prevents broken deployments
- Idempotent migrations safe to re-run

📚 **Compliance Documentation**: See [docs/v0-safe-workflow.md](docs/v0-safe-workflow.md)

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
4. **Use v0-safe migrations** for any database changes
5. Run tests and linting
6. Submit a pull request

### Database Changes
Always use the v0-safe wrapper for schema changes:
\`\`\`bash
pnpm migrate:v0safe "YOUR SQL HERE" migration-name
\`\`\`

This ensures:
- Changes are validated before applying
- Migrations are idempotent and safe to re-run
- Complete audit trail is maintained
- No production errors from malformed SQL

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue or contact the development team.

---

**MyCora** - Empowering the cannabis industry with technology 🌿
