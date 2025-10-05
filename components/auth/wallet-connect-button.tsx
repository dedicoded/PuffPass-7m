"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet } from "lucide-react"

interface WalletConnectButtonProps {
  userType: "consumer" | "merchant"
  onSuccess: (user: any) => void
  onError: (error: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function WalletConnectButton({
  userType,
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
}: WalletConnectButtonProps) {
  const [error, setError] = useState("")

  const handleWalletConnect = async () => {
    try {
      setIsLoading(true)
      setError("")

      if (!window.ethereum) {
        throw new Error("MetaMask or compatible wallet not detected")
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const walletAddress = accounts[0]

      // Sign message to verify wallet ownership
      const message = `Puff Pass Login - ${userType} - ${Date.now()}`
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      })

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType: "wallet",
          walletAddress,
          signature,
          message,
          userType,
        }),
      })

      const data = await response.json()

      console.log("[v0] Wallet login response:", data)
      console.log("[v0] User role from API:", data.user?.role)

      if (data.success) {
        onSuccess(data.user)
      } else {
        throw new Error(data.error || "Wallet authentication failed")
      }
    } catch (err: any) {
      const errorMessage = err.message || "Wallet connection failed"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleWalletConnect} disabled={isLoading} className="w-full" size="lg">
        <Wallet className="mr-2 h-4 w-4" />
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </Button>
    </div>
  )
}
