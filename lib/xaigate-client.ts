// XAIGATE API Client
// Handles all interactions with the XaiGate Wallet API
// Documentation: https://xaigate.gitbook.io/api-docs/

import { getXaigateConfig } from "./xaigate-config"

export interface CreatePaymentParams {
  amount: number
  currency?: string
  network?: string
  orderId: string
  userId: string // XaiGate requires userId for wallet generation
  description?: string
  customerEmail?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  paymentId: string
  address: string
  amount: number
  currency: string
  network: string
  qrCode: string
  expiresAt: string
  status: "pending" | "confirming" | "completed" | "expired" | "failed"
  userId: string
}

export interface PaymentStatus {
  paymentId: string
  status: "pending" | "confirming" | "completed" | "expired" | "failed"
  txHash?: string
  confirmations?: number
  completedAt?: string
  balance?: string
}

interface XaiGateGenerateAddressResponse {
  address: string
}

interface XaiGateBalanceResponse {
  balance: string
  coinShortName: string
}

interface XaiGateTransaction {
  id: string
  txid: string
  explorerUrl: string
  coin: string
  amount: string
  confirmations: number
  date: string
  status: string
  type: "deposit" | "withdraw"
}

interface XaiGateTransactionsResponse {
  results: XaiGateTransaction[]
  total: number
}

class XAIGateClient {
  private apiUrl: string
  private apiKey: string
  private mockMode: boolean

  constructor() {
    const config = getXaigateConfig()
    this.apiUrl = config.apiUrl
    this.apiKey = config.apiKey
    this.mockMode = !this.apiKey || this.apiKey === ""

    if (this.mockMode) {
      console.log("[v0] XAIGATE running in MOCK MODE - configure XAIGATE_API_KEY for production")
    }
  }

  private async request<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    if (this.mockMode) {
      return this.getMockResponse<T>(endpoint, body)
    }

    const url = `${this.apiUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          ...body,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(error.message || `XAIGATE API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("[v0] XAIGATE API request failed:", error)
      throw new Error(`Failed to connect to XAIGATE: ${error instanceof Error ? error.message : "Network error"}`)
    }
  }

  private getMockResponse<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    console.log("[v0] XAIGATE MOCK:", endpoint, body)

    if (endpoint === "/generateAddress") {
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42).padEnd(40, "0")
      return Promise.resolve({
        address: mockAddress,
      } as T)
    }

    if (endpoint === "/getBalance") {
      return Promise.resolve({
        balance: "0",
        coinShortName: body.coin || "USDC",
      } as T)
    }

    if (endpoint === "/getTransactions") {
      return Promise.resolve({
        results: [],
        total: 0,
      } as T)
    }

    return Promise.reject(new Error("Mock endpoint not implemented"))
  }

  /**
   * Create a new payment request by generating a wallet address
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    console.log("[v0] Creating XAIGATE payment:", params)

    const config = getXaigateConfig()

    if (params.amount === 0) {
      console.log("[v0] Creating test/gasless transaction with $0 amount")
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42).padEnd(40, "0")
      const paymentId = `TEST-${Date.now()}-${params.userId}`

      return {
        paymentId,
        address: mockAddress,
        amount: 0,
        currency: params.currency || config.defaultCurrency,
        network: params.network || config.defaultNetwork,
        qrCode: `ethereum:${mockAddress}?value=0`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        status: "completed",
        userId: params.userId,
      }
    }

    if (!params.amount || params.amount < config.minAmount) {
      throw new Error(`Amount must be at least $${config.minAmount}`)
    }

    if (params.amount > config.maxAmount) {
      throw new Error(`Amount cannot exceed $${config.maxAmount}`)
    }

    const networkId = params.network || config.defaultNetwork
    const response = await this.request<XaiGateGenerateAddressResponse>("/generateAddress", {
      userId: params.userId,
      networkId: networkId,
    })

    const paymentId = `PAY-${Date.now()}-${params.userId}`
    const expiresAt = new Date(Date.now() + config.paymentTimeout * 1000).toISOString()

    // Generate QR code URI based on network
    let qrCode: string
    if (networkId === "1") {
      // Ethereum
      qrCode = `ethereum:${response.address}?value=${params.amount}`
    } else if (networkId === "56") {
      // BSC
      qrCode = `binance:${response.address}?value=${params.amount}`
    } else if (networkId === "TRX") {
      // Tron
      qrCode = `tron:${response.address}?amount=${params.amount}`
    } else {
      qrCode = response.address
    }

    return {
      paymentId,
      address: response.address,
      amount: params.amount,
      currency: params.currency || config.defaultCurrency,
      network: networkId,
      qrCode,
      expiresAt,
      status: "pending",
      userId: params.userId,
    }
  }

  /**
   * Get payment status by checking wallet balance and transactions
   */
  async getPaymentStatus(userId: string, expectedAmount: number, coin = "USDC"): Promise<PaymentStatus> {
    console.log("[v0] Checking XAIGATE payment status:", { userId, expectedAmount, coin })

    const balanceResponse = await this.request<XaiGateBalanceResponse>("/getBalance", {
      userId,
      coin,
    })

    const balance = Number.parseFloat(balanceResponse.balance)
    const received = balance >= expectedAmount

    const txResponse = await this.request<XaiGateTransactionsResponse>("/getTransactions", {
      userId,
    })

    const depositTx = txResponse.results.find(
      (tx) => tx.type === "deposit" && Number.parseFloat(tx.amount) >= expectedAmount,
    )

    return {
      paymentId: `PAY-${userId}`,
      status: received ? "completed" : "pending",
      txHash: depositTx?.txid,
      confirmations: depositTx?.confirmations,
      completedAt: depositTx?.date,
      balance: balanceResponse.balance,
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string, coin = "USDC"): Promise<string> {
    const response = await this.request<XaiGateBalanceResponse>("/getBalance", {
      userId,
      coin,
    })
    return response.balance
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: string): Promise<XaiGateTransaction[]> {
    const response = await this.request<XaiGateTransactionsResponse>("/getTransactions", {
      userId,
    })
    return response.results
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const config = getXaigateConfig()

    if (!config.webhookSecret) {
      console.warn("[v0] XAIGATE webhook secret not configured - allowing webhook in development")
      return true // Allow in development
    }

    try {
      const crypto = require("crypto")
      const expectedSignature = crypto.createHmac("sha256", config.webhookSecret).update(payload).digest("hex")

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    } catch (error) {
      console.error("[v0] Webhook signature verification failed:", error)
      return false
    }
  }
}

let _xaigateClient: XAIGateClient | null = null

export function getXaigateClient(): XAIGateClient {
  if (!_xaigateClient) {
    _xaigateClient = new XAIGateClient()
  }
  return _xaigateClient
}
