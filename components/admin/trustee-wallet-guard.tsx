"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Wallet, AlertTriangle } from "lucide-react"

interface TrusteeWalletGuardProps {
  children: React.ReactNode
}

export function TrusteeWalletGuard({ children }: TrusteeWalletGuardProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkTrusteeAccess()
  }, [])

  const checkTrusteeAccess = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/auth/verify-trustee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: "0x52339752963a98b8feec09770c760ed72d7de04ae383394d4dc9eb7bab0d3f0b", // Your derived address
          signature: "mock-signature", // In production, this would be a real signature
        }),
      })

      if (response.ok) {
        setIsVerified(true)
      } else {
        const data = await response.json()
        setError(data.error || "Trustee verification failed")
      }
    } catch (err) {
      setError("Network error during verification")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 animate-pulse" />
              <span>Verifying trustee access...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Trustee Access Required</span>
            </CardTitle>
            <CardDescription>This area requires trustee wallet verification</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <Button onClick={checkTrusteeAccess} className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              Verify Trustee Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
