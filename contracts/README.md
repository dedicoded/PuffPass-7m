# PuffPass Smart Contracts

Production-ready smart contracts for the PuffPass cannabis platform.

## 📋 Contracts Overview

### 1. PuffToken.sol
**ERC20 Rewards Token**
- Symbol: PUFF
- Decimals: 18
- Max Supply: 100,000,000 PUFF
- Features: Minting, burning, permit (EIP-2612)
- Redemption: 100 PUFF = $1 USDC

### 2. ComplianceContract.sol
**Regulatory Compliance Management**
- Age verification tracking
- Merchant license management
- KYC level tracking (Basic, Enhanced, Full)
- Transaction limits (daily/monthly)
- Sanctions screening integration

### 3. MerchantProcessor.sol
**Payment Processing Engine**
- Platform fee: 2.5%
- Instant withdrawal: 7% fee
- Delayed withdrawal: 5% fee
- Automatic PUFF rewards (1 PUFF per $1 spent)
- 10% of fees fund rewards pool

### 4. PuffPassRedemption.sol
**PUFF Token Redemption**
- Redeem PUFF for USDC from Puff Vault
- Rate: 100 PUFF = $1 USDC
- Funded by merchant withdrawal fees

## 🚀 Deployment

### Prerequisites

\`\`\`bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local
\`\`\`

### Required Environment Variables

\`\`\`env
# Deployment
DEPLOYER_PRIVATE_KEY=your_private_key
SEPOLIA_URL=your_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key

# Token Addresses
USDC_TOKEN_ADDRESS=0x... # USDC contract address
PLATFORM_TREASURY_ADDRESS=0x... # Treasury wallet
PUFF_VAULT_ADDRESS=0x... # Vault wallet
\`\`\`

### Deploy All Contracts

\`\`\`bash
# Deploy to Sepolia testnet
pnpm hardhat:deploy:sepolia

# Deploy to mainnet (use with caution)
pnpm hardhat:deploy:mainnet

# Deploy to local network
pnpm hardhat:deploy:local
\`\`\`

### Deploy Individual Contracts

\`\`\`bash
# Deploy PUFF Token only
pnpm hardhat:deploy:token

# Deploy Compliance Contract only
pnpm hardhat:deploy:compliance

# Deploy Merchant Processor only
pnpm hardhat:deploy:processor

# Deploy Redemption Contract only
pnpm hardhat:deploy:redemption
\`\`\`

## 🔧 Contract Addresses

After deployment, add these to your `.env.local`:

\`\`\`env
NEXT_PUBLIC_PUFF_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_COMPLIANCE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MERCHANT_PROCESSOR_ADDRESS=0x...
NEXT_PUBLIC_REDEMPTION_CONTRACT_ADDRESS=0x...
\`\`\`

## 🧪 Testing

\`\`\`bash
# Compile contracts
pnpm hardhat compile

# Run tests
pnpm hardhat test

# Run tests with coverage
pnpm hardhat coverage

# Run gas reporter
pnpm hardhat test --gas-reporter
\`\`\`

## 📊 Gas Optimization

All contracts are optimized for production:
- Solidity 0.8.20+ (built-in overflow protection)
- Optimizer enabled (200 runs)
- Immutable variables where possible
- Efficient storage packing
- SafeERC20 for token transfers

## 🔐 Security Features

- **Access Control**: Role-based permissions (OpenZeppelin)
- **Reentrancy Protection**: ReentrancyGuard on all external calls
- **Pausable**: Emergency pause functionality
- **Audit Trail**: Events for all state changes
- **Input Validation**: Comprehensive checks on all inputs

## 📝 Contract Interactions

### Mint PUFF Rewards

\`\`\`javascript
const puffToken = await ethers.getContractAt("PuffToken", PUFF_TOKEN_ADDRESS);
await puffToken.mint(userAddress, amount, "Purchase reward");
\`\`\`

### Process Payment

\`\`\`javascript
const processor = await ethers.getContractAt("MerchantProcessor", PROCESSOR_ADDRESS);
await processor.processPayment(customer, merchant, amount);
\`\`\`

### Verify Age

\`\`\`javascript
const compliance = await ethers.getContractAt("ComplianceContract", COMPLIANCE_ADDRESS);
await compliance.verifyAge(userAddress, "ID");
\`\`\`

### Redeem PUFF

\`\`\`javascript
const redemption = await ethers.getContractAt("PuffPassRedemption", REDEMPTION_ADDRESS);
await redemption.redeem(puffAmount);
\`\`\`

## 🔄 Upgrade Strategy

Contracts use OpenZeppelin's AccessControl for role management, allowing for:
- Adding new authorized addresses
- Revoking compromised addresses
- Pausing in emergencies

For major upgrades, deploy new contracts and migrate state through admin functions.

## 📚 Additional Resources

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)

## ⚠️ Production Checklist

Before mainnet deployment:

- [ ] All tests passing
- [ ] Gas optimization verified
- [ ] Security audit completed
- [ ] Multisig wallet for admin roles
- [ ] Emergency pause procedures documented
- [ ] Contract verification on Etherscan
- [ ] Monitoring and alerting setup
- [ ] Backup private keys secured
