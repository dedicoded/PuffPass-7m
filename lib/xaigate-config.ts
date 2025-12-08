// XAIGATE Configuration for Puff Pass
// XaiGate Wallet API - Custodial wallet service for crypto payments
// Documentation: https://xaigate.gitbook.io/api-docs/

export function getXaigateConfig() {
  return {
    apiUrl: process.env.XAIGATE_API_URL || "https://wallet-api.xaigate.com/api/v1",
    apiKey: process.env.XAIGATE_API_KEY || "",

    // Webhook Configuration
    webhookSecret: process.env.XAIGATE_WEBHOOK_SECRET || "",
    webhookUrl: process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/xaigate/webhook`
      : "http://localhost:3000/api/xaigate/webhook",

    // Payment Configuration
    defaultCurrency: "USDC",
    defaultNetwork: "1", // Ethereum mainnet

    supportedNetworks: [
      {
        id: "1",
        name: "Ethereum (ERC20)",
        currency: "USDC",
        avgFee: 5, // ~$5 per tx (varies with gas)
        confirmationTime: 60, // seconds
        enabled: true,
      },
      {
        id: "56",
        name: "Binance Smart Chain (BEP20)",
        currency: "USDC",
        avgFee: 0.1, // ~$0.10 per tx
        confirmationTime: 15, // seconds
        enabled: true,
      },
      {
        id: "TRX",
        name: "Tron (TRC20)",
        currency: "USDC",
        avgFee: 1, // ~$1 per tx
        confirmationTime: 30, // seconds
        enabled: true,
      },
    ],

    // Transaction Limits
    minAmount: 1, // $1 minimum
    maxAmount: 10000, // $10,000 maximum per transaction

    // Timeout Configuration
    paymentTimeout: 900, // 15 minutes
    confirmationTimeout: 300, // 5 minutes
  }
}

export type XAIGateConfig = ReturnType<typeof getXaigateConfig>
