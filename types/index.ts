export interface User {
  id: string
  email: string
  role: "customer" | "merchant" | "admin"
  profile: UserProfile
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  firstName: string
  lastName: string
  phone?: string
  address?: Address
  preferences: UserPreferences
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface UserPreferences {
  notifications: boolean
  marketing: boolean
  theme: "light" | "dark" | "system"
}

export interface Product {
  id: string
  name: string
  description: string
  category: ProductCategory
  price: number
  thcContent?: number
  cbdContent?: number
  strain?: "indica" | "sativa" | "hybrid"
  merchantId: string
  images: string[]
  inStock: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
}

export interface Order {
  id: string
  customerId: string
  merchantId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  deliveryAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
