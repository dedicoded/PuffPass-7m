"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Fingerprint } from "lucide-react"

interface PasskeyLoginProps {
  userType: "consumer" | "merchant"
  onSuccess: (user: any) => void
  onError: (error: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function PasskeyLogin({ userType, onSuccess, onError, isLoading, setIsLoading }: PasskeyLoginProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handlePasskeyLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Email is required")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Check if passkey is supported
      if (!window.PublicKeyCredential) {
        throw new Error("Passkeys are not supported on this device")
      }

      // Create passkey credential request
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: "required",
        },
      })

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType: "email_passkey",
          email,
          passkeyCredential: credential,
          userType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess(data.user)
      } else {
        throw new Error(data.error || "Passkey login failed")
      }
    } catch (err: any) {
      const errorMessage = err.message || "Passkey login failed"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handlePasskeyLogin} className="space-y-4">
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

      <Button type="submit" disabled={isLoading} className="w-full" size="lg">
        <Fingerprint className="mr-2 h-4 w-4" />
        {isLoading ? "Authenticating..." : "Login with Passkey"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Use your device's biometric authentication or security key
      </p>
    </form>
  )
}
