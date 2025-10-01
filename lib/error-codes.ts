export const PP_ERRORS = {
  // Authentication (PP1xxx)
  AUTH_BRUTE_FORCE: "PP1001",
  AUTH_RATE_LIMITED: "PP1002",
  AUTH_INVALID_CREDENTIALS: "PP1003",
  AUTH_TOKEN_EXPIRED: "PP1004",
  AUTH_INSUFFICIENT_PRIVILEGES: "PP1005",

  // Rewards (PP2xxx)
  REDEEM_INVALID_REWARD: "PP2001",
  REDEEM_INSUFFICIENT_BALANCE: "PP2002",
  REDEEM_MERCHANT_UNAVAILABLE: "PP2003",
  REDEEM_DAILY_LIMIT_EXCEEDED: "PP2004",

  // Treasury (PP3xxx)
  TREASURY_YIELD_DIP: "PP3001",
  TREASURY_INSUFFICIENT_FLOAT: "PP3002",
  TREASURY_REBALANCE_FAILED: "PP3003",

  // KYC/Compliance (PP4xxx)
  KYC_AGE_VERIFICATION_FAILED: "PP4001",
  KYC_DOCUMENT_INVALID: "PP4002",
  KYC_VERIFICATION_PENDING: "PP4003",

  // System (PP5xxx)
  SYSTEM_MAINTENANCE: "PP5001",
  SYSTEM_RATE_LIMITED: "PP5002",
  SYSTEM_VALIDATION_ERROR: "PP5003",
} as const

export type PPErrorCode = (typeof PP_ERRORS)[keyof typeof PP_ERRORS]

export interface PPError {
  code: PPErrorCode
  message: string
  userMessage: string
  details?: any
}

export const ERROR_MESSAGES: Record<PPErrorCode, { message: string; userMessage: string }> = {
  [PP_ERRORS.AUTH_BRUTE_FORCE]: {
    message: "Brute force attack detected",
    userMessage: "Too many failed login attempts. Please try again later.",
  },
  [PP_ERRORS.AUTH_RATE_LIMITED]: {
    message: "Authentication rate limit exceeded",
    userMessage: "Please wait before trying to log in again.",
  },
  [PP_ERRORS.REDEEM_INSUFFICIENT_BALANCE]: {
    message: "Insufficient Puff Points balance",
    userMessage: "You don't have enough Puff Points for this reward.",
  },
  [PP_ERRORS.TREASURY_YIELD_DIP]: {
    message: "Treasury yield below threshold",
    userMessage: "Rewards temporarily unavailable due to market conditions.",
  },
  // ... add all other error mappings
} as any

export function createPPError(code: PPErrorCode, details?: any): PPError {
  const errorInfo = ERROR_MESSAGES[code]
  return {
    code,
    message: errorInfo.message,
    userMessage: errorInfo.userMessage,
    details,
  }
}
