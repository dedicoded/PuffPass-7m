// MyCora Platform Constants
export const PLATFORM_CONFIG = {
  name: "MyCora",
  version: "1.0.0",
  description: "Cannabis Platform for Customers, Merchants, and Admins",
} as const

export const USER_ROLES = {
  CUSTOMER: "customer",
  MERCHANT: "merchant",
  ADMIN: "admin",
} as const

export const CANNABIS_CATEGORIES = {
  FLOWER: "flower",
  EDIBLES: "edibles",
  CONCENTRATES: "concentrates",
  TOPICALS: "topicals",
  ACCESSORIES: "accessories",
} as const

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const

export const PAYMENT_METHODS = {
  CASH: "cash",
  DEBIT: "debit",
  CRYPTO: "crypto",
} as const
