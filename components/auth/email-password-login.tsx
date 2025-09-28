"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail } from "lucide-react"

interface EmailPasswordLoginProps {
  userType: "consumer" | "merchant"
  onSuccess: (user: any) => void
  onError: (error: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function EmailPasswordLogin({ userType, onSuccess, onError, isLoading, setIsLoading }: EmailPasswordLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType: "email_password",
          email,
          password,
          userType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess(data.user)
      } else {
        throw new Error(data.error || "Login failed")
      }
    } catch (err: any) {
      const errorMessage = err.message || "Login failed"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
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
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full" size="lg">
        <Mail className="mr-2 h-4 w-4" />
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      {userType === "merchant" && (
        <p className="text-xs text-muted-foreground text-center">New merchant? Contact support for account setup</p>
      )}
    </form>
  )
}
