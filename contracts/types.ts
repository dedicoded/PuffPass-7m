// MyCora Platform Type Contracts
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
  preferences?: UserPreferences
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
  newsletter: boolean
  preferredCategories: string[]
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  thcContent?: number
  cbdContent?: number
  merchantId: string
  images: string[]
  inStock: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  customerId: string
  merchantId: string
  items: OrderItem[]
  total: number
  status: string
  paymentMethod: string
  deliveryAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}
