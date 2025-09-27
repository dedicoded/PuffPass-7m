"use client"

import "@testing-library/jest-dom"
import { jest } from "@jest/globals"
import { beforeEach } from "@jest/types"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return "/"
  },
}))

// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only"
process.env.NODE_ENV = "test"

// Global test utilities
global.fetch = jest.fn()

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})
