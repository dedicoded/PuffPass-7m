import { type NextRequest, NextResponse } from "next/server"

const documentMap: Record<string, string> = {
  whitepaper: "WHITEPAPER.md",
  "stack-core": "STACK_CORE.md",
  "project-status": "PROJECT_STATUS.md",
  "team-onboarding": "TEAM_ONBOARDING.md",
}

// Document content stored inline for v0 preview compatibility
const documentContent: Record<string, string> = {
  whitepaper: `# PuffPass Protocol Whitepaper

**Version 1.0 | December 2025**

---

## Executive Summary

PuffPass is a next-generation payment and loyalty platform designed specifically for the regulated cannabis industry. Built on Polygon blockchain with USDC stablecoin support, PuffPass enables gasless transactions for merchants while maintaining full regulatory compliance through age verification, KYC/AML integration, and comprehensive audit trails.

The platform solves three critical problems in cannabis retail:
1. **Banking Access** - Traditional payment processors reject cannabis businesses
2. **High Fees** - Existing crypto solutions charge 5-15% per transaction
3. **Compliance Burden** - Regulatory requirements are complex and costly

PuffPass charges a flat **3% fee on incoming payments**, with merchants receiving their funds via **daily batch settlements at zero gas cost**. The protocol generates additional revenue through optional instant withdrawal fees (7%) versus standard delayed withdrawals (5%).

---

## Table of Contents

1. Problem Statement
2. Solution Architecture
3. Technical Implementation
4. Smart Contract Design
5. Fee Structure & Economics
6. User Roles & Workflows
7. Security & Compliance
8. Roadmap
9. Team & Governance

---

## 1. Problem Statement

### 1.1 The Cannabis Banking Crisis

Despite legalization in 38+ US states and multiple countries, cannabis businesses face severe banking restrictions:

- **70%** of cannabis businesses operate cash-only
- **$8.5B+** in annual US cannabis sales processed outside traditional banking
- **5-15%** fees charged by existing compliant payment solutions
- **Zero** major card networks (Visa, Mastercard) serve cannabis merchants

### 1.2 Existing Solutions Fall Short

| Solution | Problem |
|----------|---------|
| Cash-only | Security risks, accounting nightmares, no customer data |
| PIN debit | High fees (5-8%), unreliable, compliance concerns |
| ACH/Check | Slow (3-5 days), high failure rates |
| Existing crypto | Complex UX, volatile assets, gas fee burden on users |

### 1.3 The Opportunity

PuffPass addresses these gaps with:
- **Stablecoin payments** (USDC) - No volatility risk
- **Polygon network** - Sub-cent transaction costs
- **Gasless for merchants** - PuffPass covers all network fees
- **Built-in compliance** - Age verification, KYC, audit trails
- **Loyalty integration** - PUFF points reward system

---

## 2. Solution Architecture

### 2.1 High-Level Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         PuffPass Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│   │ Consumer │    │ Merchant │    │  Admin   │    │ Trustee  │  │
│   │   App    │    │Dashboard │    │  Panel   │    │  Portal  │  │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘  │
│        │               │               │               │         │
│        └───────────────┴───────────────┴───────────────┘         │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │   Next.js API     │                        │
│                    │     Routes        │                        │
│                    └─────────┬─────────┘                        │
│                              │                                   │
│        ┌─────────────────────┼─────────────────────┐            │
│        │                     │                     │            │
│   ┌────▼────┐          ┌─────▼─────┐         ┌────▼────┐       │
│   │  Neon   │          │  Polygon  │         │ Upstash │       │
│   │PostgreSQL│         │PuffPassRouter│      │  Redis  │       │
│   └─────────┘          └───────────┘         └─────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### 2.2 Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 15, React 19 | Server-rendered web application |
| Database | Neon PostgreSQL | User data, orders, compliance logs |
| Blockchain | Polygon (MATIC) | USDC payments, smart contracts |
| Cache | Upstash Redis | Session management, rate limiting |
| Storage | Vercel Blob | Document storage (KYC, receipts) |
| Auth | Custom JWT + Wallet | Multi-factor authentication |

---

## 3. Technical Implementation

### 3.1 Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19 with Server Components
- TailwindCSS v4 + shadcn/ui
- ethers.js v6 for Web3

**Backend:**
- Next.js API Routes
- Drizzle ORM
- Neon serverless PostgreSQL
- Upstash Redis for caching

**Blockchain:**
- Polygon Mainnet (Chain ID: 137)
- USDC (0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359)
- Solidity 0.8.20 smart contracts
- Hardhat development framework

**Infrastructure:**
- Vercel (hosting + edge functions)
- Vercel Blob (file storage)
- Upstash (Redis + Vector Search)

---

## 4. Smart Contract Design

### 4.1 PuffPassRouter Contract

The core payment contract deployed on Polygon:

\`\`\`solidity
contract PuffPassRouter is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;
    address public treasury;
    
    // Merchant vault balances (net after 3% fee)
    mapping(address => uint256) public merchantVaults;
    
    // Fee structure
    uint256 public constant BASE_FEE_BPS = 300;     // 3%
    uint256 public constant INSTANT_FEE_BPS = 700;  // 7%
    uint256 public constant DELAYED_FEE_BPS = 500;  // 5%
    
    function pay(address merchant, uint256 amount) external;
    function batchSettle(address[] calldata merchants, uint256[] calldata amounts) external;
}
\`\`\`

### 4.2 Contract Features

| Feature | Description |
|---------|-------------|
| Atomic Payments | Single transaction: deduct fee, credit merchant vault |
| Batch Settlements | Admin sends USDC to multiple merchants in one tx |
| Reentrancy Protection | OpenZeppelin ReentrancyGuard |
| Owner Controls | Update treasury, emergency drain |
| Event Logging | All payments and settlements emit events |

---

## 5. Fee Structure & Economics

### 5.1 Revenue Model

**Payment Flow ($100 USDC):**

1. Customer Pays: $100.00 USDC
2. PuffPassRouter Contract:
   - 3% Fee = $3.00 → Treasury
   - 97% Net = $97.00 → Vault
3. Merchant Withdrawal:
   - Option A: Delayed (5% fee) = $97.00 × 0.95 = $92.15
   - Option B: Instant (7% fee) = $97.00 × 0.93 = $90.21

**Total PuffPass Revenue:**
- Delayed: $3.00 + $4.85 = $7.85 (7.85%)
- Instant: $3.00 + $6.79 = $9.79 (9.79%)

### 5.2 Unit Economics

**Per $100 Transaction:**
- Gross Revenue: $7.85 - $9.79
- Gas Cost: ~$0.01 (Polygon)
- Net Margin: 99.8%+

**At Scale (1,000 merchants, $10K/day each):**
- Daily Volume: $10,000,000
- Daily Revenue: $785,000 - $979,000
- Monthly Revenue: $23.5M - $29.4M

---

## 6. User Roles & Workflows

### 6.1 Consumer Journey

1. Registration → Email/wallet signup, Age verification (21+)
2. Shopping → Browse merchant products, Add to cart
3. Payment → Connect wallet, Approve USDC, Confirm payment
4. Rewards → Earn PUFF points, Redeem for discounts

### 6.2 Merchant Journey

1. Onboarding → Business registration, Connect wallet, KYC
2. Receiving Payments → Customer pays, 97% credited to vault
3. Withdrawals → Choose delayed (5%) or instant (7%)
4. Analytics → View sales dashboard, Track insights

### 6.3 Admin Capabilities

- Approve/reject merchant applications
- Trigger batch settlements
- View compliance reports
- Manage treasury allocation

---

## 7. Security & Compliance

### 7.1 Security Measures

| Layer | Implementation |
|-------|----------------|
| Authentication | JWT + wallet signature + session tokens |
| Authorization | Role-based access control (RBAC) |
| Encryption | TLS 1.3, AES-256 for sensitive data |
| Smart Contracts | OpenZeppelin, ReentrancyGuard |
| Rate Limiting | Upstash Redis rate limiter |

### 7.2 Compliance Framework

**Age Verification:**
- ID document verification
- Third-party age verification APIs
- IP-based geolocation checks

**KYC/AML:**
- Identity document collection
- Address verification
- Watchlist screening
- Ongoing transaction monitoring

---

## 8. Roadmap

### Phase 1: Foundation (Complete)
- [x] Core platform architecture
- [x] User authentication system
- [x] Merchant onboarding flow
- [x] Product management
- [x] Order processing

### Phase 2: Payments (In Progress)
- [x] PuffPassRouter smart contract
- [x] Polygon payment component
- [ ] Deploy to Mumbai testnet
- [ ] Deploy to Polygon mainnet
- [ ] Daily batch settlement automation

### Phase 3: Compliance (Planned)
- [ ] Full KYC integration
- [ ] Age verification API
- [ ] Automated compliance reporting

### Phase 4: Rewards (Planned)
- [ ] PUFF points system
- [ ] Loyalty tier progression
- [ ] Redemption processing

### Phase 5: Scale (Future)
- [ ] Multi-state rollout
- [ ] Enterprise API
- [ ] Mobile applications

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| USDC | USD Coin, a regulated stablecoin pegged 1:1 to USD |
| Polygon | EVM-compatible Layer 2 blockchain with low fees |
| Gas | Network fee required to execute blockchain transactions |
| Vault | On-chain balance held for a merchant pending withdrawal |
| Batch Settlement | Multiple merchant payouts in a single transaction |
| PUFF Points | Loyalty points earned through platform usage |

---

**Copyright 2025 PuffPass Protocol. All Rights Reserved.**
`,

  "stack-core": `# PuffPass Technical Stack Documentation

**Version 1.0 | December 2025**

---

## 1. Architecture Overview

PuffPass is built on a modern serverless architecture:

- **Frontend**: Next.js 15 with React 19
- **Backend**: Next.js API Routes (serverless)
- **Database**: Neon PostgreSQL (serverless)
- **Cache**: Upstash Redis
- **Blockchain**: Polygon Network
- **Hosting**: Vercel

---

## 2. Frontend Stack

### Framework
- Next.js 15 (App Router)
- React 19 with Server Components
- TypeScript 5.x

### Styling
- TailwindCSS v4
- shadcn/ui components
- CSS Variables for theming

### Web3
- ethers.js v6
- MetaMask integration
- WalletConnect support

---

## 3. Backend Stack

### API Framework
- Next.js API Routes
- Route Handlers (App Router)
- Server Actions

### Database
- Neon PostgreSQL (serverless)
- Drizzle ORM
- Connection pooling via Neon proxy

### Caching
- Upstash Redis
- Session storage
- Rate limiting

---

## 4. Database Schema

### Core Tables

\`\`\`sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  role ENUM('customer', 'merchant', 'admin', 'trustee'),
  wallet_address VARCHAR,
  kyc_status ENUM('pending', 'approved', 'rejected'),
  created_at TIMESTAMP
)

merchants (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  business_name VARCHAR,
  wallet_address VARCHAR,
  vault_balance DECIMAL,
  status ENUM('pending', 'approved', 'rejected'),
  created_at TIMESTAMP
)

products (
  id UUID PRIMARY KEY,
  merchant_id UUID REFERENCES merchants,
  name VARCHAR,
  description TEXT,
  price DECIMAL,
  thc_content DECIMAL,
  cbd_content DECIMAL,
  category VARCHAR,
  inventory INTEGER
)

orders (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES users,
  merchant_id UUID REFERENCES merchants,
  status ENUM('pending', 'paid', 'completed', 'cancelled'),
  total_amount DECIMAL,
  tx_hash VARCHAR,
  created_at TIMESTAMP
)

transactions (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  type ENUM('payment', 'withdrawal', 'settlement'),
  amount DECIMAL,
  fee DECIMAL,
  tx_hash VARCHAR,
  status ENUM('pending', 'confirmed', 'failed'),
  created_at TIMESTAMP
)
\`\`\`

---

## 5. Smart Contracts

### PuffPassRouter

**Location:** \`contracts/PuffPassRouter.sol\`

Core payment router handling USDC payments with 3% fee.

**Key Functions:**
- \`pay(address merchant, uint256 amount)\` - Process payment
- \`batchSettle(address[] merchants, uint256[] amounts)\` - Batch payouts
- \`withdraw(address merchant, uint256 amount)\` - Single withdrawal

**Contract Addresses:**
| Network | Address |
|---------|---------|
| Mumbai Testnet | TBD |
| Polygon Mainnet | TBD |

---

## 6. API Reference

### Authentication

\`\`\`
POST /api/auth/register     - Create account
POST /api/auth/login        - Authenticate
POST /api/auth/logout       - End session
GET  /api/auth/session      - Validate session
\`\`\`

### Admin

\`\`\`
GET  /api/admin/merchants       - List merchants
POST /api/admin/batch-settlement - Trigger payouts
GET  /api/admin/treasury-stats  - Treasury metrics
GET  /api/admin/compliance      - Compliance reports
\`\`\`

### Merchant

\`\`\`
GET  /api/merchant/profile      - Get profile
PUT  /api/merchant/profile      - Update profile
GET  /api/merchant/balance      - Vault balance
POST /api/merchant/withdraw     - Request withdrawal
GET  /api/merchant/analytics    - Sales analytics
\`\`\`

### Consumer

\`\`\`
GET  /api/consumer/balance      - PUFF balance
GET  /api/consumer/rewards      - Available rewards
POST /api/consumer/redeem       - Redeem points
\`\`\`

---

## 7. Key Components

### PolygonPayment

\`components/polygon-payment.tsx\`

Handles USDC payments through PuffPassRouter contract.

**Props:**
- \`amount\`: number - USDC amount
- \`merchantAddress\`: string - Merchant wallet
- \`orderId\`: string - Order reference
- \`onSuccess\`: (tx) => void - Success callback
- \`onCancel\`: () => void - Cancel callback

### MerchantOnboarding

\`components/merchant-onboarding.tsx\`

Two-step merchant registration flow.

### TreasuryDashboard

\`components/treasury-dashboard.tsx\`

Admin dashboard for treasury metrics.

---

## 8. Environment Variables

### Required

\`\`\`
DATABASE_URL                          - Neon PostgreSQL
KV_REST_API_URL                       - Upstash Redis URL
KV_REST_API_TOKEN                     - Upstash Redis token
JWT_SECRET                            - Auth secret
NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS   - Contract address
\`\`\`

### Optional

\`\`\`
POLYGON_RPC_URL                       - Custom RPC
POLYGON_PRIVATE_KEY                   - Deployment key
CRON_SECRET                           - Cron auth
\`\`\`

---

## 9. Deployment

### Local Development

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

### Production

\`\`\`bash
pnpm build
vercel deploy --prod
\`\`\`

### Contract Deployment

\`\`\`bash
# Mumbai Testnet
npx hardhat run scripts/deploy-polygon-router.ts --network mumbai

# Polygon Mainnet
npx hardhat run scripts/deploy-polygon-router.ts --network polygon
\`\`\`

---

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| "PuffPassRouter not configured" | Set NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS |
| "Failed to connect to MetaMask" | Install MetaMask extension |
| Database connection failed | Check DATABASE_URL |
| "ethers.providers undefined" | Use BrowserProvider (ethers v6) |

---

**Last Updated:** December 2025
`,

  "project-status": `# PuffPass Project Status

**Last Updated:** December 2025

---

## Executive Summary

PuffPass is approximately **70% complete** for MVP launch. Core infrastructure is built and functional. Primary remaining work involves contract deployment, payment testing, and compliance integration.

---

## Completion Status by Module

### Core Infrastructure (95% Complete)

| Component | Status |
|-----------|--------|
| Next.js App Router | Done |
| Database Schema | Done |
| Authentication | Done |
| API Routes | Done |
| UI Components | Done |
| Role-based Access | Done |

### Smart Contracts (90% Complete)

| Component | Status |
|-----------|--------|
| PuffPassRouter.sol | Done |
| Contract Tests | Done |
| Mumbai Deployment | Pending |
| Mainnet Deployment | Pending |

### Payment System (75% Complete)

| Component | Status |
|-----------|--------|
| PolygonPayment Component | Done |
| Fee Calculation | Done |
| Batch Settlement Service | Done |
| Cron Job | Done |
| Production Testing | Pending |

### Merchant Dashboard (85% Complete)

| Component | Status |
|-----------|--------|
| Merchant Onboarding | Done |
| Vault Balance Display | Done |
| Withdrawal Requests | Done |
| Analytics Dashboard | Partial |

### Consumer Experience (80% Complete)

| Component | Status |
|-----------|--------|
| Product Browsing | Done |
| Shopping Cart | Done |
| USDC Payments | Done |
| PUFF Points | Partial |

### Compliance (50% Complete)

| Component | Status |
|-----------|--------|
| Age Verification Logging | Done |
| KYC Document Upload | Done |
| Automated Verification | Pending |
| Regulatory Reporting | Pending |

---

## Immediate Priorities

### Week 1: Contract Deployment
1. Deploy PuffPassRouter to Mumbai testnet
2. Run integration tests
3. Deploy to Polygon mainnet
4. Update environment variables

### Week 2: Payment Testing
1. End-to-end payment test
2. Batch settlement test
3. Withdrawal flow test

### Week 3: Compliance Integration
1. Integrate age verification API
2. Automated KYC verification
3. Transaction monitoring

### Week 4: Polish & Launch
1. UI/UX refinements
2. Performance optimization
3. Beta user onboarding

---

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| MetaMask connection on / page | Low | Open |
| XAIGate integration deprecated | Low | Resolved |
| ethers v6 compatibility | Medium | Fixed |

---

## Technical Debt

1. Remove XAIGate code (legacy)
2. Consolidate auth patterns
3. Database migration consolidation
4. Add more unit tests
5. Standardize error responses

---

## Team Action Items

### Backend Developer
- Deploy and verify smart contracts
- Set up automated batch settlement cron
- Integrate third-party KYC API

### Frontend Developer
- Complete PUFF points redemption UI
- Polish merchant analytics dashboard
- Mobile responsive testing

### DevOps
- Set up production environment variables
- Configure monitoring/alerting
- Document deployment procedures

---

## Success Metrics for Launch

| Metric | Target | Current |
|--------|--------|---------|
| Core features complete | 100% | 70% |
| Contract deployed | Yes | No |
| Test transactions | >10 | 0 |
| Documentation complete | 100% | 80% |

---

**Copyright 2025 PuffPass Protocol.**
`,

  "team-onboarding": `# PuffPass Team Onboarding Guide

Welcome to the PuffPass development team!

---

## Quick Start

### 1. Clone & Install

\`\`\`bash
git clone [repository-url]
cd puffpass
pnpm install
\`\`\`

### 2. Environment Setup

\`\`\`bash
cp .env.example .env.local
\`\`\`

Required variables (ask team lead):
- DATABASE_URL
- JWT_SECRET
- KV_REST_API_URL
- KV_REST_API_TOKEN

### 3. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Visit http://localhost:3000

---

## Key Documentation

| Document | Purpose |
|----------|---------|
| WHITEPAPER.md | Protocol overview |
| STACK_CORE.md | Technical reference |
| PROJECT_STATUS.md | Current progress |

---

## Architecture Overview

\`\`\`
User → Next.js Frontend → API Routes → Database/Blockchain
                                    ↓
                          PuffPassRouter (Polygon)
                                    ↓
                          USDC Stablecoin Transfers
\`\`\`

**Key Flow:**
1. Consumer browses products
2. Adds items to cart
3. Connects wallet (MetaMask)
4. Pays via PuffPassRouter contract
5. 3% fee goes to treasury
6. 97% credited to merchant vault
7. Daily batch settlement sends USDC to merchants

---

## Important Files

| File | Purpose |
|------|---------|
| app/page.tsx | Landing page |
| app/layout.tsx | Root layout |
| components/polygon-payment.tsx | Payment component |
| contracts/PuffPassRouter.sol | Payment contract |
| lib/db.ts | Database connection |
| lib/auth.ts | Authentication |

---

## Development Workflow

### Branch Naming
- feature/description
- fix/description
- docs/description

### Commit Messages
- feat: Add new feature
- fix: Bug fix
- docs: Documentation
- refactor: Code refactoring

---

## Common Tasks

### Add API Endpoint

\`\`\`typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: "example" })
}
\`\`\`

### Add Component

\`\`\`tsx
// components/example.tsx
"use client"

export function Example() {
  return <div>Example</div>
}
\`\`\`

---

## Debugging

### Enable Debug Logging

\`\`\`typescript
console.log("[v0] Debug:", variable)
\`\`\`

### Check Connections

\`\`\`bash
curl http://localhost:3000/api/test-db-connection
curl http://localhost:3000/api/web3/health
\`\`\`

---

## First Week Checklist

- [ ] Complete local setup
- [ ] Read WHITEPAPER.md
- [ ] Read STACK_CORE.md
- [ ] Explore the codebase
- [ ] Make a small contribution
- [ ] Ask questions!

Welcome aboard!

---

**Copyright 2025 PuffPass Protocol.**
`,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const docId = searchParams.get("doc")

  if (!docId || !documentContent[docId]) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  const content = documentContent[docId]
  const filename = documentMap[docId] || `${docId}.md`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="puffpass-${filename}"`,
    },
  })
}
