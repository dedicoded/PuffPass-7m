import { POST } from "@/app/api/auth/register/route"
import { NextRequest } from "next/server"
import jest from "jest"

// Mock database functions
jest.mock("@/lib/db", () => ({
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
}))

import { createUser, getUserByEmail } from "@/lib/db"

describe("/api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should register user with valid data", async () => {
    // Mock database responses
    ;(getUserByEmail as jest.Mock).mockResolvedValue(null) // User doesn't exist
    ;(createUser as jest.Mock).mockResolvedValue({
      id: "123",
      email: "test@example.com",
      role: "customer",
      age: 25,
      created_at: new Date(),
    })

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "SecurePass123!",
        role: "customer",
        age: 25,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.email).toBe("test@example.com")
    expect(data.token).toBeTruthy()
  })

  it("should reject duplicate email", async () => {
    // Mock existing user
    ;(getUserByEmail as jest.Mock).mockResolvedValue({
      id: "123",
      email: "test@example.com",
    })

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "SecurePass123!",
        role: "customer",
        age: 25,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain("already exists")
  })

  it("should reject invalid email format", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "invalid-email",
        password: "SecurePass123!",
        role: "customer",
        age: 25,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain("validation")
  })

  it("should reject weak password", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "123", // Too short
        role: "customer",
        age: 25,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain("validation")
  })

  it("should reject underage user", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "SecurePass123!",
        role: "customer",
        age: 18, // Under 21
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain("age")
  })
})
