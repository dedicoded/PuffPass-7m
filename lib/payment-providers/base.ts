// Payment Provider Interface - Pluggable architecture for multiple payment processors

export interface PaymentProvider {
  name: string
  processPayment(params: PaymentParams): Promise<PaymentResult>
  createCustomer(params: CustomerParams): Promise<CustomerResult>
  getTransactionStatus(txnId: string): Promise<TransactionStatus>
}

export interface PaymentParams {
  userId: string
  amount: number
  currency: string
  symbol?: string // Crypto symbol (e.g., "BTC-USD", "ETH-USD")
  walletAddress?: string
  fees?: number // Added fees parameter for payment processing
  metadata?: Record<string, any>
}

export interface PaymentResult {
  success: boolean
  transactionId: string
  status: "pending" | "confirmed" | "failed" | "settling"
  mode: "test" | "live"
  provider: string
  details?: Record<string, any> // Changed from 'any' to 'Record<string, any>' for better type safety
  error?: string
}

export interface CustomerParams {
  userId: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  dateOfBirth?: string
}

export interface CustomerResult {
  success: boolean
  customerId: string
  provider: string
  error?: string
}

export interface TransactionStatus {
  id: string
  status: "pending" | "confirmed" | "failed" | "settling"
  amount: number
  currency: string
  createdAt: string
  updatedAt: string
}
