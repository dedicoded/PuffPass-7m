"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Building2, Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "customer"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const roleConfig = {
    customer: {
      title: "Cannabis Customer Login",
      description: "Access your cannabis shopping account",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    merchant: {
      title: "Cannabis Merchant Login",
      description: "Access your dispensary management dashboard",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    admin: {
      title: "Platform Admin Login",
      description: "Access platform administration tools",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  }

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.customer
  const Icon = config.icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Attempting login for:", email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", response.headers.get("content-type"))

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Server returned non-JSON response:", contentType)
        const textResponse = await response.text()
        console.error("[v0] Response text:", textResponse.substring(0, 200))
        setError("Server error. Please try again later.")
        return
      }

      const data = await response.json()
      console.log("[v0] Parsed response data:", data)

      if (data.success) {
        console.log("[v0] Login successful, redirecting user with role:", data.user.role)
        switch (data.user.role) {
          case "customer":
            router.push("/customer")
            break
          case "merchant":
            router.push("/merchant")
            break
          case "admin":
            router.push("/admin")
            break
          default:
            router.push("/")
        }
      } else {
        console.log("[v0] Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className={`w-full ${config.buttonColor} text-white`} disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <a href={`/register?role=${role}`} className={`${config.color} hover:underline`}>
                Register here
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
