/**
 * Integration tests for complete authentication flow
 * These tests simulate the full user journey: register → login → access protected routes
 */

import { POST as registerPOST } from "@/app/api/auth/register/route"
import { POST as loginPOST } from "@/app/api/auth/login/route"
import { NextRequest } from "next/server"
import { jest } from "@jest/globals"

// Mock database with in-memory storage for integration tests
const mockUsers: any[] = []

jest.mock("@/lib/db", () => ({
  createUser: jest.fn().mockImplementation(async (userData) => {
    const user = {
      id: String(mockUsers.length + 1),
      ...userData,
      created_at: new Date(),
    }
    mockUsers.push(user)
    return user
  }),
  getUserByEmail: jest.fn().mockImplementation(async (email) => {
    return mockUsers.find((user) => user.email === email) || null
  }),
  getUserByEmailAndRole: jest.fn().mockImplementation(async (email, role) => {
    return mockUsers.find((user) => user.email === email && user.role === role) || null
  }),
}))

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    // Clear mock database
    mockUsers.length = 0
    jest.clearAllMocks()
  })

  it("should complete full auth cycle: register → login → access", async () => {
    const testUser = {
      email: "integration@example.com",
      password: "SecurePass123!",
      role: "customer" as const,
      age: 25,
    }

    // Step 1: Register user
    const registerRequest = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    })

    const registerResponse = await registerPOST(registerRequest)
    const registerData = await registerResponse.json()

    expect(registerResponse.status).toBe(201)
    expect(registerData.user.email).toBe(testUser.email)
    expect(registerData.token).toBeTruthy()

    // Step 2: Login with same credentials
    const loginRequest = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        role: testUser.role,
      }),
    })

    const loginResponse = await loginPOST(loginRequest)
    const loginData = await loginResponse.json()

    expect(loginResponse.status).toBe(200)
    expect(loginData.user.email).toBe(testUser.email)
    expect(loginData.token).toBeTruthy()

    // Step 3: Verify tokens are different (new session)
    expect(registerData.token).not.toBe(loginData.token)

    // Step 4: Verify user exists in mock database
    expect(mockUsers).toHaveLength(1)
    expect(mockUsers[0].email).toBe(testUser.email)
    expect(mockUsers[0].password_hash).toBeTruthy()
    expect(mockUsers[0].password_hash).not.toBe(testUser.password) // Should be hashed
  })

  it("should prevent duplicate registration", async () => {
    const testUser = {
      email: "duplicate@example.com",
      password: "SecurePass123!",
      role: "customer" as const,
      age: 25,
    }

    // Register user first time
    const firstRequest = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    })

    const firstResponse = await registerPOST(firstRequest)
    expect(firstResponse.status).toBe(201)

    // Try to register same user again
    const secondRequest = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    })

    const secondResponse = await registerPOST(secondRequest)
    const secondData = await secondResponse.json()

    expect(secondResponse.status).toBe(409)
    expect(secondData.error).toContain("already exists")
    expect(mockUsers).toHaveLength(1) // Still only one user
  })

  it("should handle role-based login correctly", async () => {
    // Register users with different roles
    const customerUser = {
      email: "customer@example.com",
      password: "SecurePass123!",
      role: "customer" as const,
      age: 25,
    }

    const merchantUser = {
      email: "merchant@example.com",
      password: "SecurePass123!",
      role: "merchant" as const,
      age: 30,
    }

    // Register both users
    await registerPOST(
      new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerUser),
      }),
    )

    await registerPOST(
      new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merchantUser),
      }),
    )

    // Try to login customer with merchant role (should fail)
    const wrongRoleRequest = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customerUser.email,
        password: customerUser.password,
        role: "merchant", // Wrong role
      }),
    })

    const wrongRoleResponse = await loginPOST(wrongRoleRequest)
    expect(wrongRoleResponse.status).toBe(401)

    // Login with correct role (should succeed)
    const correctRoleRequest = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customerUser.email,
        password: customerUser.password,
        role: customerUser.role,
      }),
    })

    const correctRoleResponse = await loginPOST(correctRoleRequest)
    expect(correctRoleResponse.status).toBe(200)
  })
})
