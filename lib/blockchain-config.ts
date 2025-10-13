/**
 * Blockchain Configuration
 *
 * This file centralizes all blockchain-related configuration.
 * It automatically switches between testnet and mainnet based on environment variables.
 */

export const BLOCKCHAIN_CONFIG = {
  // Network selection
  network: (process.env.NEXT_PUBLIC_NETWORK || "sepolia") as "sepolia" | "mainnet" | "polygon",

  // Chain IDs
  chainIds: {
    sepolia: 11155111,
    mainnet: 1,
    polygon: 137,
  },

  // RPC URLs
  rpcUrls: {
    sepolia: process.env.SEPOLIA_RPC_URL || process.env.SEPOLIA_URL || "https://sepolia.infura.io/v3/demo",
    mainnet: process.env.MAINNET_URL || "",
    polygon: process.env.POLYGON_URL || "",
  },

  // Contract addresses (update after deployment)
  contracts: {
    compliance: process.env.NEXT_PUBLIC_COMPLIANCE_CONTRACT_ADDRESS || "",
    merchantProcessor: process.env.NEXT_PUBLIC_MERCHANT_PROCESSOR_ADDRESS || "",
    mcc: process.env.NEXT_PUBLIC_MCC_CONTRACT_ADDRESS || "",
    security: process.env.NEXT_PUBLIC_SECURITY_CONTRACT_ADDRESS || "",
    puffpass: process.env.NEXT_PUBLIC_PUFFPASS_CONTRACT_ADDRESS || "",
    utility: process.env.NEXT_PUBLIC_UTILITY_CONTRACT_ADDRESS || "",
  },

  // Block explorers
  explorers: {
    sepolia: "https://sepolia.etherscan.io",
    mainnet: "https://etherscan.io",
    polygon: "https://polygonscan.com",
  },

  // Feature flags
  features: {
    realTransactions: process.env.NEXT_PUBLIC_ENABLE_REAL_TRANSACTIONS === "true",
    testMode: process.env.NODE_ENV === "development",
  },

  // Get current chain ID
  get currentChainId() {
    return this.chainIds[this.network]
  },

  // Get current RPC URL
  get currentRpcUrl() {
    return this.rpcUrls[this.network]
  },

  // Get current explorer
  get currentExplorer() {
    return this.explorers[this.network]
  },

  // Check if using real blockchain
  get isRealBlockchain() {
    return this.features.realTransactions && this.currentRpcUrl !== ""
  },
}

// Helper function to get transaction URL
export function getTransactionUrl(txHash: string): string {
  return `${BLOCKCHAIN_CONFIG.currentExplorer}/tx/${txHash}`
}

// Helper function to get address URL
export function getAddressUrl(address: string): string {
  return `${BLOCKCHAIN_CONFIG.currentExplorer}/address/${address}`
}

// Validation helper
export function validateBlockchainConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!BLOCKCHAIN_CONFIG.currentRpcUrl) {
    errors.push(`Missing RPC URL for ${BLOCKCHAIN_CONFIG.network}`)
  }

  if (BLOCKCHAIN_CONFIG.features.realTransactions) {
    if (
      !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID === "demo-project-id"
    ) {
      errors.push("Real transactions enabled but WalletConnect project ID not configured")
    }

    const missingContracts = Object.entries(BLOCKCHAIN_CONFIG.contracts)
      .filter(([_, address]) => !address)
      .map(([name]) => name)

    if (missingContracts.length > 0) {
      errors.push(`Missing contract addresses: ${missingContracts.join(", ")}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
