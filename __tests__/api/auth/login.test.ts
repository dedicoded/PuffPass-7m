import { POST } from "@/app/api/auth/login/route"
import { NextRequest } from "next/server"
import jest from "jest" // Declare the jest variable

// Mock database and crypto functions
jest.mock("@/lib/db", () => ({
  getUserByEmailAndRole: jest.fn(),
}))

jest.mock("@/lib/crypto-utils", () => ({
  verifyPassword: jest.fn(),
}))

import { getUserByEmailAndRole } from "@/lib/db"
import { verifyPassword } from "@/lib/crypto-utils"

describe("/api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should login user with correct credentials", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      password_hash: "$2b$10$hashedpassword",
      role: "customer",
      age: 25,
    }
    ;(getUserByEmailAndRole as jest.Mock).mockResolvedValue(mockUser)
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "SecurePass123!",
        role: "customer",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe("test@example.com")
    expect(data.token).toBeTruthy()
  })

  it("should reject wrong password", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      password_hash: "$2b$10$hashedpassword",
      role: "customer",
      age: 25,
    }
    ;(getUserByEmailAndRole as jest.Mock).mockResolvedValue(mockUser)
    ;(verifyPassword as jest.Mock).mockResolvedValue(false) // Wrong password

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "WrongPassword123!",
        role: "customer",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toContain("Invalid credentials")
  })

  it("should reject non-existent user", async () => {
    ;(getUserByEmailAndRole as jest.Mock).mockResolvedValue(null) // User not found

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "SecurePass123!",
        role: "customer",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toContain("Invalid credentials")
  })

  it("should reject wrong role", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      password_hash: "$2b$10$hashedpassword",
      role: "customer",
      age: 25,
    }
    ;(getUserByEmailAndRole as jest.Mock).mockResolvedValue(null) // No user with that role

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "SecurePass123!",
        role: "admin", // Wrong role
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toContain("Invalid credentials")
  })
})
