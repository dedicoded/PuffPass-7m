# PuffPass Protocol Whitepaper

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

1. [Problem Statement](#problem-statement)
2. [Solution Architecture](#solution-architecture)
3. [Technical Implementation](#technical-implementation)
4. [Smart Contract Design](#smart-contract-design)
5. [Fee Structure & Economics](#fee-structure--economics)
6. [User Roles & Workflows](#user-roles--workflows)
7. [Security & Compliance](#security--compliance)
8. [Roadmap](#roadmap)
9. [Team & Governance](#team--governance)

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

### 3.2 Database Schema

\`\`\`sql
-- Core Tables
users (id, email, password_hash, role, kyc_status, wallet_address)
merchants (id, user_id, business_name, wallet_address, vault_balance)
products (id, merchant_id, name, thc_content, cbd_content, price)
orders (id, customer_id, merchant_id, status, total_amount)
transactions (id, order_id, type, amount, tx_hash, status)

-- Compliance Tables
age_verification_logs (id, user_id, method, result, ip_address)
kyc_submissions (id, user_id, status, documents, verified_at)
compliance_audits (id, merchant_id, type, result, auditor)

-- Rewards System
puff_balances (user_id, balance, tier, lifetime_points)
puff_transactions (id, user_id, type, amount, description)
rewards_catalog (id, merchant_id, name, puff_cost, inventory)
\`\`\`

### 3.3 API Architecture

\`\`\`
/api
├── auth/
│   ├── register        POST  - Create new user account
│   ├── login           POST  - Authenticate user
│   ├── logout          POST  - End session
│   └── session         GET   - Validate current session
├── admin/
│   ├── merchants       GET   - List all merchants
│   ├── batch-settlement POST - Trigger merchant payouts
│   ├── compliance      GET   - View compliance reports
│   └── treasury-stats  GET   - View treasury metrics
├── merchant/
│   ├── profile         GET/PUT - Merchant profile
│   ├── balance         GET   - Current vault balance
│   ├── withdraw        POST  - Request withdrawal
│   └── analytics       GET   - Sales analytics
├── consumer/
│   ├── balance         GET   - PUFF point balance
│   ├── rewards         GET   - Available rewards
│   └── redeem          POST  - Redeem PUFF points
└── cron/
    └── daily-settlement POST - Automated batch settlements
\`\`\`

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
