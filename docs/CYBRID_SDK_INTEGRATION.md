# Cybrid Web SDK Integration Guide

This document explains the complete Cybrid Web SDK integration in PuffPass.

## Overview

PuffPass now uses the official Cybrid Web SDK (`@cybrid/cybrid-sdk-ui-js`) to provide seamless cryptocurrency payment processing through Cybrid Banking.

## Architecture

### 1. Configuration (`lib/cybrid-config.ts`)

Centralized configuration for all Cybrid settings:
- Organization GUID: `059526698b52ef3827e417f794da7bfe`
- Bank GUID: `2a28078007155bdecf9f237834f3decd`
- Account GUIDs:
  - Reserve: `4229014f138435ba0e8dfc3be1153ccb` (Customer funds)
  - Gas: `1dd9e5ab2387fed0282fb3309cc939ee` (Blockchain transactions)
  - Fee: `1c1916b4b892cb81d6f73faf8a57cc34` (PuffPass treasury)

### 2. Authentication (`app/api/cybrid/auth/token/route.ts`)

Server-side API route that:
1. Authenticates with Cybrid using client credentials (OAuth 2.0)
2. Generates customer bearer tokens for SDK initialization
3. Returns token with bank GUID and environment

### 3. Provider Component (`components/cybrid-provider.tsx`)

React context provider that:
1. Fetches customer bearer token from API
2. Initializes Cybrid SDK with configuration
3. Handles loading and error states
4. Wraps child components with Cybrid context

### 4. Web Components

#### Trade Component (`components/cybrid-trade-component.tsx`)
- Wraps Cybrid's `<cybrid-trade>` web component
- Allows users to buy/sell cryptocurrency
- Configurable asset (BTC, ETH, etc.) and fiat (USD)

#### Price List Component (`components/cybrid-price-list.tsx`)
- Wraps Cybrid's `<cybrid-price-list>` web component
- Displays real-time cryptocurrency prices
- Auto-updates with market data

### 5. Onramp Page (`app/onramp/page.tsx`)

Simplified payment flow:
1. **Select Payment Method** - Choose Cybrid Banking
2. **Trade Cryptocurrency** - Use Cybrid SDK components for seamless trading
3. **Complete** - Transaction processed through Cybrid

### 6. Admin Dashboard (`app/admin/cybrid/page.tsx`)

Management interface showing:
- All three Cybrid accounts (Reserve, Gas, Fee)
- Real-time balances and availability
- Account status and metadata
- Direct link to Cybrid dashboard

### 7. API Integration (`app/api/cybrid/accounts/route.ts`)

Backend API that:
1. Authenticates with Cybrid OAuth
2. Fetches all bank accounts
3. Returns account details with balances
4. Includes configured account GUIDs

## Environment Variables

### Required (Public - Safe for Client)
\`\`\`env
NEXT_PUBLIC_CYBRID_ORGANIZATION_GUID="059526698b52ef3827e417f794da7bfe"
NEXT_PUBLIC_CYBRID_BANK_GUID="2a28078007155bdecf9f237834f3decd"
NEXT_PUBLIC_CYBRID_API_URL="https://bank.sandbox.cybrid.app"
NEXT_PUBLIC_CYBRID_ENVIRONMENT="sandbox"
NEXT_PUBLIC_CYBRID_RESERVE_ACCOUNT_GUID="4229014f138435ba0e8dfc3be1153ccb"
NEXT_PUBLIC_CYBRID_GAS_ACCOUNT_GUID="1dd9e5ab2387fed0282fb3309cc939ee"
NEXT_PUBLIC_CYBRID_FEE_ACCOUNT_GUID="1c1916b4b892cb81d6f73faf8a57cc34"
\`\`\`

### Required (Private - Server Only)
\`\`\`env
CYBRID_CLIENT_ID="a1JlaDZU"
CYBRID_CLIENT_SECRET="your_client_secret_from_dashboard"
\`\`\`

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

The `@cybrid/cybrid-sdk-ui-js` package is already added to `package.json`.

### 2. Configure Environment Variables

Add the environment variables to your Vercel project:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the variables listed above
4. Redeploy your application

### 3. Test the Integration

1. Navigate to `/onramp` in your application
2. Select "Cybrid Banking" as payment method
3. The Cybrid SDK components should load
4. You can view real-time prices and execute trades

### 4. Monitor Accounts

1. Navigate to `/admin/cybrid` in your application
2. View all three accounts with real-time balances
3. Click "Open Dashboard" to access Cybrid's admin panel

## Transaction Flow

### Customer Deposit Flow

1. **User initiates deposit** on `/onramp` page
2. **Cybrid SDK loads** with customer bearer token
3. **User selects cryptocurrency** (BTC, ETH, etc.)
4. **User enters amount** in USD
5. **Cybrid processes payment** through banking rails
6. **Funds deposited** to Reserve Account (`4229...3ccb`)
7. **PUFF tokens minted** and credited to user's wallet

### Fee Distribution

- **Customer pays**: Amount + Processing Fee (2.5% displayed)
- **Cybrid fee**: 1.5% (actual processing fee)
- **PuffPass treasury**: 1% (routed to Fee Account `1c19...cc34`)
- **Gas costs**: Paid from Gas Account (`1dd9...39ee`)

## Security Considerations

1. **Client Credentials**: Never expose `CYBRID_CLIENT_SECRET` to the client
2. **Bearer Tokens**: Generated server-side and short-lived
3. **Account GUIDs**: Public GUIDs are safe to expose (read-only)
4. **OAuth Scopes**: Limited to necessary permissions only

## Troubleshooting

### SDK Not Loading
- Check that `NEXT_PUBLIC_CYBRID_*` variables are set
- Verify bearer token is being generated successfully
- Check browser console for initialization errors

### Authentication Errors
- Verify `CYBRID_CLIENT_ID` and `CYBRID_CLIENT_SECRET` are correct
- Check that OAuth scopes include your organization and bank GUIDs
- Ensure API URL matches your environment (sandbox vs production)

### Account Balance Issues
- Verify account GUIDs match your Cybrid dashboard
- Check that accounts are in "created" state
- Ensure sufficient balance in Gas Account for transactions

## Production Checklist

Before going to production:

- [ ] Update `CYBRID_ENVIRONMENT` to `"production"`
- [ ] Update `CYBRID_API_URL` to `"https://bank.cybrid.app"`
- [ ] Generate production API credentials from Cybrid
- [ ] Update all account GUIDs to production accounts
- [ ] Test complete deposit flow with real funds
- [ ] Monitor transaction fees and gas costs
- [ ] Set up alerts for low account balances

## Resources

- [Cybrid Web SDK GitHub](https://github.com/Cybrid-app/cybrid-sdk-web)
- [Cybrid API Documentation](https://docs.cybrid.xyz/)
- [Cybrid Dashboard](https://dashboard.cybrid.app/)
- [OAuth 2.0 Guide](https://docs.cybrid.xyz/docs/authentication)

## Support

For issues with the Cybrid integration:
1. Check the browser console for errors
2. Review server logs for API failures
3. Visit `/admin/cybrid` to verify account status
4. Contact Cybrid support for API issues
