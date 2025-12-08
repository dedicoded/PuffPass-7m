# Monerium + Gnosis Pay Integration Research

## Executive Summary

Monerium and Gnosis Pay provide a regulatory-compliant fiat-to-crypto solution for EU users, enabling EUR deposits, stablecoin conversion, and real-world spending via Mastercard debit cards.

## Monerium Overview

### What is Monerium?
- **Regulatory Status**: EU-regulated e-money institution
- **Supported Currencies**: EUR (EURS stablecoin), ISK, GBP
- **Supported Networks**: Ethereum, Polygon, Gnosis Chain
- **Core Function**: Fiat on/off-ramp with SEPA bank transfers

### Key Features
- Web3 IBAN: Instant EUR → EURe conversion
- Automatic on-chain deposits when EUR sent to IBAN
- Automatic off-ramp: EURe → EUR bank account
- OAuth 2.0 PKCE authentication
- Safe{Core} SDK integration

### API Capabilities

#### Authentication
- OAuth 2.0 with PKCE (Proof Key for Code Exchange)
- Bearer token authentication
- Safe wallet signature verification

#### Core Endpoints
\`\`\`
POST /auth - Initiate authorization flow
POST /token - Exchange authorization code for access token
GET /orders - Retrieve payment orders
POST /orders - Create new order (EUR → EURe or EURe → EUR)
GET /accounts - Get linked bank accounts and IBANs
\`\`\`

#### Integration Flow
1. User authenticates with Monerium (email/password)
2. Safe wallet signs link message to prove ownership
3. Monerium verifies signature on-chain
4. Monerium generates Web3 IBAN linked to Safe
5. User deposits EUR via SEPA → EURe appears in wallet
6. User can withdraw EURe → EUR to bank account

### SDK Installation
\`\`\`bash
npm install @monerium/sdk
\`\`\`

### Example Code
\`\`\`typescript
import { MoneriumClient } from '@monerium/sdk'

// Initialize client
const monerium = new MoneriumClient({
  clientId: 'your-client-id',
  environment: 'production' // or 'sandbox'
})

// Start authorization
await monerium.authorize({
  address: safeAddress,
  signature: '0x', // For Safe authentication
  redirectUrl: 'https://yourapp.com/callback',
  chainId: 1 // Ethereum mainnet
})

// After redirect, get auth code
const authCode = new URLSearchParams(window.location.search).get('code')

// Get bearer token
await monerium.auth({
  authCode,
  codeVerifier: savedCodeVerifier
})

// Place order (on-ramp: EUR → EURe)
await monerium.placeOrder({
  amount: '100',
  currency: 'eur',
  address: userWalletAddress,
  message: 'Deposit to PuffPass',
  chain: 'ethereum'
})
\`\`\`

## Gnosis Pay Overview

### What is Gnosis Pay?
- **Type**: Crypto debit card service
- **Network**: Mastercard
- **Supported Chains**: Gnosis Chain (primary), Ethereum
- **Core Function**: Spend crypto directly via physical/virtual cards

### Key Features
- Physical and virtual Mastercard debit cards
- Real-time crypto → fiat conversion at point-of-sale
- Daily spending limits (configurable on-chain)
- Safe-based account architecture
- Sign-In with Ethereum (SIWE) authentication
- Webhook notifications for transactions

### API Capabilities

#### Authentication
- JWT via Sign-In with Ethereum (SIWE)
- Bearer token authentication
- Safe wallet signature required

#### Core Endpoints
\`\`\`
POST /api/v1/auth/signin - SIWE authentication
GET /api/v1/cards - List user's cards
POST /api/v1/cards/order - Order new card
GET /api/v1/cards/transactions - Retrieve transactions
GET /api/v1/account - Get account details
POST /api/v1/safe/owners - Manage Safe owners
\`\`\`

#### Integration Flow
1. User authenticates via SIWE (wallet signature)
2. Backend verifies signature and issues JWT
3. User completes KYC process
4. User orders physical/virtual card
5. Card linked to Gnosis Pay Safe wallet
6. User loads EURe into Safe
7. User spends at point-of-sale → EURe converted to EUR

### SDK Installation
\`\`\`bash
npm install @gnosispay/account-kit
\`\`\`

### Example Code
\`\`\`typescript
const GNOSIS_PAY_API = 'https://api.gnosispay.com'

class GnosisPayClient {
  constructor(authToken) {
    this.authToken = authToken
  }

  async getTransactions(params = {}) {
    const queryParams = new URLSearchParams(params)
    const response = await fetch(
      `${GNOSIS_PAY_API}/api/v1/cards/transactions?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.json()
  }

  async orderCard(type = 'virtual') {
    const response = await fetch(
      `${GNOSIS_PAY_API}/api/v1/cards/order`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cardType: type })
      }
    )
    return response.json()
  }
}
\`\`\`

## Integration Strategy for PuffPass

### Architecture Overview
\`\`\`
User Flow:
1. User signs up → Embedded wallet created (existing PuffPass flow)
2. User links Monerium → Safe signature + OAuth flow
3. Monerium generates Web3 IBAN
4. User deposits EUR → Receives EURe in wallet
5. User orders Gnosis Pay card → KYC completion
6. User loads EURe into Gnosis Pay Safe
7. User spends via card at merchants
\`\`\`

### Technical Requirements

#### Prerequisites
- Safe wallet deployment (multi-sig or 1-of-1)
- Monerium partner account and OAuth credentials
- Gnosis Pay partner integration
- KYC provider integration
- EU/EEA jurisdiction compliance

#### Database Schema Extensions
\`\`\`sql
-- Monerium accounts
CREATE TABLE monerium_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  monerium_profile_id VARCHAR,
  iban VARCHAR,
  safe_address VARCHAR,
  chain_id INTEGER,
  status VARCHAR, -- 'linked', 'verified', 'suspended'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gnosis Pay cards
CREATE TABLE gnosis_pay_cards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  card_id VARCHAR,
  card_type VARCHAR, -- 'physical', 'virtual'
  safe_address VARCHAR,
  status VARCHAR, -- 'ordered', 'active', 'frozen', 'cancelled'
  daily_limit DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Unified transactions
CREATE TABLE fiat_crypto_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR, -- 'deposit', 'withdrawal', 'card_payment', 'refund'
  provider VARCHAR, -- 'monerium', 'gnosis_pay'
  amount DECIMAL,
  currency VARCHAR,
  status VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### API Routes to Implement
\`\`\`
POST /api/monerium/auth - Initiate Monerium OAuth
GET /api/monerium/callback - Handle OAuth redirect
POST /api/monerium/link-account - Link Safe to Monerium
POST /api/monerium/deposit - Create EUR deposit order
POST /api/monerium/withdraw - Create EURe withdrawal order
GET /api/monerium/balance - Get EURe balance

POST /api/gnosis-pay/auth - SIWE authentication
POST /api/gnosis-pay/order-card - Order physical/virtual card
GET /api/gnosis-pay/cards - List user's cards
GET /api/gnosis-pay/transactions - Get card transactions
POST /api/gnosis-pay/set-limit - Update daily spending limit
POST /api/gnosis-pay/freeze-card - Freeze/unfreeze card
\`\`\`

#### Frontend Components Needed
\`\`\`
/components/monerium-connect.tsx - OAuth connection flow
/components/iban-display.tsx - Show Web3 IBAN for deposits
/components/gnosis-pay-card-order.tsx - Card ordering UI
/components/gnosis-pay-card-dashboard.tsx - Card management
/components/fiat-balance-widget.tsx - Show EUR/EURe balance
/components/transaction-history.tsx - Unified transaction list
\`\`\`

### Security Considerations

#### Monerium Security
- OAuth PKCE flow prevents authorization code interception
- Safe signature verification ensures wallet ownership
- Bearer tokens expire (refresh token flow required)
- SEPA transfers have regulatory protections

#### Gnosis Pay Security
- SIWE prevents phishing attacks
- Safe multi-sig adds transaction approval layer
- Daily limits prevent catastrophic losses
- Card freeze capability for lost/stolen cards
- Webhook signature verification required

### Compliance Requirements

#### KYC/AML
- Monerium requires identity verification
- Gnosis Pay requires separate KYC for card issuance
- EU GDPR compliance mandatory
- Transaction monitoring for AML
- Suspicious activity reporting

#### Regulatory
- E-money license (Monerium holds this)
- Payment service provider regulations
- Consumer protection laws
- Data residency requirements (EU)

### Cost Structure

#### Monerium Fees
- Deposit (EUR → EURe): Typically free or low SEPA fee
- Withdrawal (EURe → EUR): ~€1-2 SEPA fee
- Monthly account fee: Check partner pricing
- No gas fees for on-ramp (Monerium covers)

#### Gnosis Pay Fees
- Card issuance: ~€10-20 for physical card
- Card usage: Mastercard interchange fees apply
- Currency conversion: 1-2% markup typical
- ATM withdrawals: Standard ATM fees
- Monthly card fee: Check partner pricing

### Implementation Timeline

#### Phase 1: Monerium Integration (2-3 weeks)
- Set up Monerium partner account
- Implement OAuth PKCE flow
- Deploy Safe wallets for users
- Create deposit/withdrawal UI
- Test in sandbox environment

#### Phase 2: Gnosis Pay Integration (3-4 weeks)
- Set up Gnosis Pay partner account
- Implement SIWE authentication
- Integrate KYC provider
- Build card ordering flow
- Create card management dashboard
- Test card transactions

#### Phase 3: Testing & Compliance (2-3 weeks)
- End-to-end testing with real EUR
- Compliance review
- Security audit
- User acceptance testing
- Documentation

### Risks & Mitigations

#### Risk: Jurisdictional Restrictions
- **Mitigation**: Implement geo-blocking for non-EU users
- **Mitigation**: Clear messaging about availability

#### Risk: KYC Abandonment
- **Mitigation**: Streamlined KYC flow
- **Mitigation**: Save progress for later completion

#### Risk: Exchange Rate Volatility
- **Mitigation**: Use stablecoins (EURe is 1:1 EUR)
- **Mitigation**: Real-time conversion at POS

#### Risk: Regulatory Changes
- **Mitigation**: Monitor MiCA regulations
- **Mitigation**: Maintain flexibility in provider choice

## Comparison: Monerium+Gnosis vs XAIGate

| Feature | Monerium+Gnosis | XAIGate |
|---------|-----------------|---------|
| **Fiat On-Ramp** | Yes (SEPA) | No |
| **Crypto Support** | EURe only | USDC, USDT, multi-chain |
| **Real-World Spending** | Yes (Mastercard) | No |
| **Regulation** | EU-regulated | Varies |
| **KYC Required** | Yes | Depends on amount |
| **Supported Regions** | EU/EEA | Global |
| **User Experience** | Bank-like | Crypto-native |
| **Integration Complexity** | High (2 APIs) | Medium (1 API) |

## Recommendation

**For PuffPass**: Implement both solutions as complementary payment providers:

1. **Monerium + Gnosis Pay**: Target EU users who want fiat on-ramps and real-world spending
2. **XAIGate**: Target global crypto users who prefer direct USDC/USDT payments

This multi-provider approach maximizes addressable market while providing flexibility for different user preferences and regulatory jurisdictions.

## Next Steps

1. **Immediate**: Contact Monerium and Gnosis Pay for partner accounts
2. **Week 1**: Set up sandbox environments and test credentials
3. **Week 2**: Implement Monerium OAuth flow and Safe integration
4. **Week 3**: Build deposit/withdrawal UI
5. **Week 4**: Implement Gnosis Pay SIWE auth
6. **Week 5**: Build card ordering and management
7. **Week 6-7**: End-to-end testing
8. **Week 8**: Compliance review and launch

## Resources

- Monerium API Docs: https://monerium.dev/docs/api
- Monerium SDK: https://github.com/monerium/js-sdk
- Gnosis Pay Docs: https://docs.gnosispay.com
- Gnosis Pay SDK: https://github.com/gnosispay/account-kit
- Safe{Core} SDK: https://docs.safe.global/sdk
