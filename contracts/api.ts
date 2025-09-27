// MyCora API Contract Definitions
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth API Contracts
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "customer" | "merchant"
}

export interface AuthResponse extends ApiResponse {
  data: {
    user: any // Placeholder for User type, please define it
    token: string
  }
}

// Product API Contracts
export interface ProductsQuery {
  category?: string
  search?: string
  merchantId?: string
  page?: number
  limit?: number
}

export interface CreateProductRequest {
  name: string
  description: string
  category: string
  price: number
  thcContent?: number
  cbdContent?: number
  images: string[]
}

// Order API Contracts
export interface CreateOrderRequest {
  items: Array<{
    productId: string
    quantity: number
  }>
  paymentMethod: string
  deliveryAddress: any // Placeholder for Address type, please define it
}
