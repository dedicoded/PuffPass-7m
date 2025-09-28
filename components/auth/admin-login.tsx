"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Wallet } from "lucide-react"

interface AdminLoginProps {
  onSuccess: (user: any) => void
  onError: (error: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function AdminLogin({ onSuccess, onError, isLoading, setIsLoading }: AdminLoginProps) {
  const [error, setError] = useState("")

  const handleMetaMaskLogin = async () => {
    try {
      setIsLoading(true)
      setError("")

      if (!window.ethereum) {
        throw new Error("MetaMask not detected. Admin access requires MetaMask.")
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const walletAddress = accounts[0]

      // Sign message to verify wallet ownership
      const message = `Puff Pass Admin Login - ${Date.now()}`
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      })

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType: "admin_wallet",
          walletAddress,
          signature,
          message,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess(data.user)
      } else {
        throw new Error(data.error || "Admin authentication failed")
      }
    } catch (err: any) {
      const errorMessage = err.message || "Admin login failed"
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

      <div className="space-y-4">
        <div className="flex items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Admin access restricted to deployer wallet</p>
          </div>
        </div>

        <Button onClick={handleMetaMaskLogin} disabled={isLoading} className="w-full" size="lg">
          <Wallet className="mr-2 h-4 w-4" />
          {isLoading ? "Verifying..." : "Connect MetaMask"}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Hardware wallet recommended</p>
          <p>• All actions are logged and audited</p>
          <p>• Session expires in 1 hour</p>
        </div>
      </div>
    </div>
  )
}
