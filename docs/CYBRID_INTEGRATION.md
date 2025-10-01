# Cybrid Integration Guide

## Overview

PuffPass uses Cybrid as the primary payment provider for fiat-to-crypto onramp. This guide explains how to use the production-ready Cybrid integration.

## Architecture

The payment system uses a **pluggable provider architecture** that makes it easy to add new payment providers without changing existing code.

### Key Components

1. **Payment Provider Interface** (`/lib/payment-providers/base.ts`)
   - Defines the contract all payment providers must implement
   - Ensures consistent API across different providers

2. **Cybrid Provider** (`/lib/payment-providers/cybrid.ts`)
   - Production-ready implementation of Cybrid API
   - Handles OAuth authentication, customer creation, quotes, and trades
   - Automatic token refresh and caching

3. **Provider Registry** (`/lib/payment-providers/registry.ts`)
   - Centralized management of payment providers
   - Easy provider registration and retrieval

4. **Unified Payment API** (`/app/api/payments/process/route.ts`)
   - Provider-agnostic endpoint for processing payments
   - Automatically routes to the correct provider

## Environment Variables

Required environment variables for Cybrid:

\`\`\`bash
# Cybrid Configuration
CYBRID_API_URL="https://bank.sandbox.cybrid.app"
CYBRID_CLIENT_ID="your_client_id"
CYBRID_CLIENT_SECRET="your_client_secret"
CYBRID_BANK_GUID="your_bank_guid"
CYBRID_ORG_GUID="your_org_guid"
\`\`\`

### Your MyCora Sandbox Configuration

Based on your screenshots, your environment should have:

\`\`\`bash
CYBRID_API_URL="https://bank.sandbox.cybrid.app"
CYBRID_BANK_GUID="b90128ef166ec0158c4a3627776600c8"
CYBRID_ORG_GUID="e658f582bfe3d7fcc8f6985ab918dad9"
CYBRID_CLIENT_ID="a1JIA6ZCzqVjm48gPbabmC6vllltogXDvqDlkcaDZU"
CYBRID_CLIENT_SECRET="bzNQWNuJQqSkrgUPmILbgUrEbFLkdkDQR7kk6GcQ"
\`\`\`

## API Usage

### Process Payment

\`\`\`typescript
// Using the unified API (recommended)
const response = await fetch('/api/payments/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'cybrid',
    userId: 'user_123',
    amount: 100.00,
    currency: 'USD',
    symbol: 'BTC-USD', // Optional, defaults to BTC-USD
  })
})

const result = await response.json()
// {
//   success: true,
//   transaction: {
//     transactionId: "trade_guid_from_cybrid",
//     status: "pending",
//     mode: "live",
//     provider: "cybrid"
//   }
// }
\`\`\`

### Create Customer

\`\`\`typescript
const response = await fetch('/api/cybrid/create-customer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_123',
    personalDetails: {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      address: '123 Main St',
      city: 'Washington',
      state: 'DC',
      zipCode: '20001',
      country: 'US'
    }
  })
})
\`\`\`

## Cybrid Workflow

### 1. Customer Creation
- Check if customer exists by `external_customer_id` (your user ID)
- If not, create new customer with KYC details
- Store `customer_guid` in your database

### 2. Payment Processing
1. **Authenticate**: Get OAuth token (cached for performance)
2. **Get Customer**: Retrieve or create customer
3. **Create Quote**: Request price quote for crypto purchase
4. **Execute Trade**: Execute the trade using the quote
5. **Record Transaction**: Save transaction details to database

### 3. Transaction States

Cybrid trade states mapped to PuffPass statuses:
- `pending` → Cybrid: "pending", "storing"
- `settling` → Cybrid: "settling"
- `confirmed` → Cybrid: "completed"
- `failed` → Cybrid: "failed"

## Supported Crypto Assets

Your MyCora sandbox supports USD fiat currency. Common trading pairs:
- `BTC-USD` - Bitcoin
- `ETH-USD` - Ethereum
- `USDC-USD` - USD Coin
- `USDT-USD` - Tether

## Testing

### Test Mode
If Cybrid credentials are not configured, the system automatically falls back to test mode:
- Generates simulated transaction IDs
- Records transactions in database
- Returns success responses for testing UI

### Sandbox Mode
With your MyCora sandbox credentials:
- Real API calls to Cybrid sandbox
- No real money involved
- Full workflow testing
- Realistic transaction states

### Production Mode
For production deployment:
1. Get production Cybrid credentials
2. Update `CYBRID_API_URL` to production endpoint
3. Complete compliance requirements
4. Test with small amounts first

## Adding New Payment Providers

To add a new provider (e.g., Sphere, Stripe):

1. **Implement the interface**:
\`\`\`typescript
// lib/payment-providers/sphere.ts
import { PaymentProvider } from './base'

export class SphereProvider implements PaymentProvider {
  name = 'sphere'
  
  async processPayment(params) {
    // Sphere-specific implementation
  }
  
  async createCustomer(params) {
    // Sphere-specific implementation
  }
  
  async getTransactionStatus(txnId) {
    // Sphere-specific implementation
  }
}
\`\`\`

2. **Register the provider**:
\`\`\`typescript
// lib/payment-providers/registry.ts
import { SphereProvider } from './sphere'

paymentRegistry.register(new SphereProvider())
\`\`\`

3. **Use it**:
\`\`\`typescript
const response = await fetch('/api/payments/process', {
  method: 'POST',
  body: JSON.stringify({
    provider: 'sphere', // Just change the provider name
    userId: 'user_123',
    amount: 100.00
  })
})
\`\`\`

## Monitoring & Debugging

All Cybrid operations log with `[v0]` prefix for easy filtering:

\`\`\`bash
[v0] Cybrid: Requesting new OAuth token
[v0] Cybrid: OAuth token obtained successfully
[v0] Cybrid: Creating customer for user user_123
[v0] Cybrid: Customer created successfully abc123
[v0] Cybrid: Processing payment { userId: 'user_123', amount: 100, ... }
[v0] Cybrid: Quote created quote_guid_123
[v0] Cybrid: Trade executed successfully trade_guid_456
[v0] Payment processed successfully trade_guid_456
\`\`\`

## Security Best Practices

1. **Never expose credentials** - Keep all Cybrid credentials server-side only
2. **Use environment variables** - Never hardcode API keys
3. **Validate inputs** - Always validate user inputs before API calls
4. **Rate limiting** - Implement rate limiting on payment endpoints
5. **Audit logging** - Log all payment transactions for compliance
6. **Token caching** - OAuth tokens are cached to reduce API calls

## Compliance & Regulations

For DC cannabis operations:
- Cybrid handles KYC/AML compliance
- Customer identity verification required
- Transaction monitoring included
- Regulatory reporting available

## Support

- **Cybrid Documentation**: https://docs.cybrid.xyz
- **Cybrid Dashboard**: https://dashboard.cybrid.xyz
- **Your MyCora Bank**: https://dashboard.cybrid.xyz/banks/b90128ef166ec0158c4a3627776600c8

## Next Steps

1. ✅ Cybrid provider implemented
2. ✅ Pluggable architecture ready
3. ⏳ Test with your MyCora sandbox
4. ⏳ Add Sphere provider (optional)
5. ⏳ Deploy to production
6. ⏳ Monitor transactions
