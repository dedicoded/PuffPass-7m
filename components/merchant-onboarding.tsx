"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface MerchantInfo {
  walletAddress: string
  businessName: string
  category: string
  vaultBalance: string
  totalReceived: string
  withdrawalFeeRate: number
}

export function MerchantOnboarding() {
  const [step, setStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [account, setAccount] = useState<string>("")
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo>({
    walletAddress: "",
    businessName: "",
    category: "",
    vaultBalance: "0",
    totalReceived: "0",
    withdrawalFeeRate: 0,
  })

  useEffect(() => {
    connectWallet()
  }, [])

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccount(accounts[0])
        setMerchantInfo((prev) => ({ ...prev, walletAddress: accounts[0] }))
        loadMerchantInfo(accounts[0])
      } catch (err) {
        console.error("Failed to connect wallet:", err)
      }
    }
  }

  const loadMerchantInfo = async (address: string) => {
    try {
      const response = await fetch(`/api/merchants/${address}`)
      if (response.ok) {
        const data = await response.json()
        setMerchantInfo((prev) => ({ ...prev, ...data }))
        if (data.businessName) {
          setStep(2)
        }
      }
    } catch (err) {
      console.error("Failed to load merchant info:", err)
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setMerchantInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!account) {
        throw new Error("Please connect your wallet first")
      }

      const response = await fetch("/api/merchants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: account,
          businessName: merchantInfo.businessName,
          category: merchantInfo.category,
        }),
      })

      if (!response.ok) {
        throw new Error("Registration failed")
      }

      setSuccess("Merchant registered successfully!")
      setStep(2)
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawal = async (instant: boolean) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!account) {
        throw new Error("Please connect your wallet first")
      }

      const response = await fetch("/api/merchants/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: account,
          instant,
        }),
      })

      if (!response.ok) {
        throw new Error("Withdrawal request failed")
      }

      const data = await response.json()
      setSuccess(
        instant
          ? `Instant withdrawal of ${data.netAmount} USDC requested`
          : `Withdrawal of ${data.netAmount} USDC requested (will be processed in 3-5 days)`,
      )
    } catch (err: any) {
      setError(err.message || "Withdrawal failed")
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Merchant Registration</CardTitle>
          <CardDescription>Register your business to start accepting USDC payments</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Business Name</Label>
              <Input
                value={merchantInfo.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Business Category</Label>
              <Select value={merchantInfo.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Wallet Address</Label>
              <Input value={account || "Not connected"} readOnly className="bg-muted" />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Registering..." : "Register Merchant"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Merchant Dashboard</CardTitle>
          <CardDescription>Manage your vault and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Wallet Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-1">Address:</p>
                <p className="font-mono text-xs break-all">{merchantInfo.walletAddress}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vault Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{merchantInfo.vaultBalance} USDC</p>
                <p className="text-sm text-muted-foreground">Available for withdrawal</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Withdrawal Options</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Delayed Withdrawal (3-5 days)</CardTitle>
                  <CardDescription>5% fee, lower cost</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleWithdrawal(false)}
                    disabled={loading || Number.parseFloat(merchantInfo.vaultBalance) === 0}
                    className="w-full"
                    variant="default"
                  >
                    {loading ? "Processing..." : "Request Withdrawal"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Instant Withdrawal</CardTitle>
                  <CardDescription>7% fee, immediate</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleWithdrawal(true)}
                    disabled={loading || Number.parseFloat(merchantInfo.vaultBalance) === 0}
                    className="w-full"
                    variant="secondary"
                  >
                    {loading ? "Processing..." : "Request Instant Withdrawal"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Customers pay in USDC and 3% fee goes to PuffPass</li>
                <li>Net amount (97%) goes to your vault automatically</li>
                <li>You can withdraw daily via batch settlement</li>
                <li>Choose between instant (7% fee) or delayed (5% fee) withdrawal</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
