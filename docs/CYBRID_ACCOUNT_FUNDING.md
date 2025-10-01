# Cybrid Account Funding Guide

## Overview

Your Cybrid bank requires three types of accounts to process transactions:

1. **Reserve Account** (`d4a91e9f7b2fb69f614cce1cbd5afef5`)
   - Holds customer funds in custody
   - Must be funded before accepting customer deposits
   - Balance represents total customer funds held

2. **Gas Account** (`f56796578a29046f2b2c3174c1d2f166`)
   - Pays blockchain transaction fees for crypto operations
   - Must be funded before processing crypto transactions
   - Automatically debited for each blockchain transaction

3. **Fee Account** (`1c57fc5df9f6781e660038933fde15c1`)
   - Collects platform fees from transactions
   - Automatically credited when fees are charged
   - No manual funding required

## Current Status

Based on your Cybrid dashboard screenshot:

\`\`\`
Account Type | GUID                             | Balance  | State
-------------|----------------------------------|----------|--------
Reserve      | d4a91e9f7b2fb69f614cce1cbd5afef5 | 0.00 USD | Created
Gas          | f56796578a29046f2b2c3174c1d2f166 | 0.00 USD | Created
Fee          | 1c57fc5df9f6781e660038933fde15c1 | 0.00 USD | Created
\`\`\`

⚠️ **All accounts have zero balance** - You need to fund the Gas and Reserve accounts before processing real transactions.

## Funding Methods

### Option 1: Sandbox Testing (Recommended First)

For testing in the Cybrid sandbox environment:

1. **Use Test Funds**
   - Cybrid sandbox provides virtual test funds
   - No real money required
   - Perfect for development and testing

2. **Simulate Deposits**
   \`\`\`bash
   npm run test-cybrid-sandbox
   \`\`\`
   This script will create a test customer, generate a quote, and simulate a trade.

### Option 2: Production Funding

For production environments with real money:

1. **Fund Gas Account**
   - Transfer USD to cover blockchain transaction fees
   - Recommended starting amount: $100-500 USD
   - Monitor balance and refill as needed

2. **Fund Reserve Account**
   - Transfer USD to match expected customer deposits
   - Amount depends on your business volume
   - Must maintain sufficient balance for customer withdrawals

3. **Funding Process**
   - Contact Cybrid support for wire transfer instructions
   - Provide your Bank GUID: `b90128ef166ec0158c4a3627776600c8`
   - Specify which account to fund (Gas or Reserve)

## Account Balance Monitoring

### Check Balances via API

\`\`\`typescript
const response = await fetch(
  `${CYBRID_API_URL}/api/accounts?bank_guid=${CYBRID_BANK_GUID}`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
)

const accounts = await response.json()
accounts.objects.forEach((account) => {
  console.log(`${account.type}: ${account.platform_balance} ${account.asset}`)
})
\`\`\`

### Set Up Balance Alerts

Add monitoring to your application:

\`\`\`typescript
// lib/cybrid-monitor.ts
export async function checkLowBalances() {
  const accounts = await listAccounts()
  
  const gasAccount = accounts.find(a => a.type === 'gas')
  const reserveAccount = accounts.find(a => a.type === 'reserve')
  
  // Alert if gas account below $50
  if (parseFloat(gasAccount.platform_balance) < 50) {
    await sendAlert('Gas account low - refill needed')
  }
  
  // Alert if reserve account below expected customer deposits
  if (parseFloat(reserveAccount.platform_balance) < expectedDeposits) {
    await sendAlert('Reserve account low - customer withdrawals may fail')
  }
}
\`\`\`

## Transaction Flow

### Customer Deposit Flow

1. Customer initiates deposit
2. Funds transferred to **Reserve Account**
3. Customer's internal balance updated
4. Reserve account balance increases

### Customer Withdrawal Flow

1. Customer requests withdrawal
2. Funds transferred from **Reserve Account**
3. Customer's internal balance decreased
4. Reserve account balance decreases

### Crypto Transaction Flow

1. Customer buys/sells crypto
2. **Gas Account** pays blockchain fees
3. **Fee Account** receives platform fees
4. **Reserve Account** holds the fiat value

## Best Practices

### Gas Account Management

- Monitor daily transaction volume
- Maintain 2-4 weeks of gas fees in reserve
- Set up automatic alerts at 25% threshold
- Typical gas cost: $0.50-$5.00 per transaction

### Reserve Account Management

- Always maintain 100%+ of customer deposits
- Never use reserve funds for operational expenses
- Reconcile daily with customer balance totals
- Implement withdrawal limits if balance is low

### Fee Account Management

- No funding required - automatically credited
- Withdraw fees periodically for business operations
- Track fee revenue for financial reporting
- Ensure fee structure covers gas costs

## Compliance Requirements

### Regulatory Considerations

1. **Reserve Account = Customer Funds**
   - Must be segregated from operational funds
   - Subject to audit and regulatory oversight
   - Cannot be used for business expenses

2. **Gas Account = Operational Expense**
   - Business expense for transaction processing
   - Can be funded from business accounts
   - Track for tax deduction purposes

3. **Fee Account = Revenue**
   - Platform revenue from transactions
   - Subject to income tax
   - Must be reported in financial statements

## Troubleshooting

### "Insufficient Balance" Errors

**Error**: Transaction fails with insufficient balance

**Solution**:
1. Check which account is low (Gas or Reserve)
2. Fund the appropriate account
3. Wait 5-10 minutes for balance to update
4. Retry the transaction

### Balance Not Updating

**Issue**: Funded account but balance still shows zero

**Solution**:
1. Check transaction status in Cybrid dashboard
2. Verify correct account GUID was used
3. Contact Cybrid support if delay exceeds 1 hour
4. Check for pending/processing status

### Gas Account Depleting Quickly

**Issue**: Gas account balance decreasing faster than expected

**Solution**:
1. Review transaction volume - may be higher than anticipated
2. Check for failed transactions (still consume gas)
3. Optimize transaction batching to reduce gas costs
4. Consider increasing gas account buffer

## Next Steps

1. ✅ **Validate Configuration**
   \`\`\`bash
   npm run validate-cybrid
   \`\`\`

2. ✅ **Test in Sandbox**
   \`\`\`bash
   npm run test-cybrid-sandbox
   \`\`\`

3. ⚠️ **Fund Accounts** (when ready for production)
   - Contact Cybrid support
   - Provide Bank GUID: `b90128ef166ec0158c4a3627776600c8`
   - Request funding instructions

4. ✅ **Monitor Balances**
   - Set up automated alerts
   - Check balances daily
   - Maintain adequate reserves

## Support

- **Cybrid Support**: support@cybrid.com
- **Documentation**: https://docs.cybrid.xyz
- **Dashboard**: https://bank.sandbox.cybrid.app
