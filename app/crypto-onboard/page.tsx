"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { ArrowRight, Wallet, CreditCard, Shield, CheckCircle } from "lucide-react"
import { useAccount } from "wagmi"
import { toast } from "sonner"

export default function CryptoOnboardPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { address, isConnected } = useAccount()
  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
  })
  const [transferDetails, setTransferDetails] = useState({
    amount: "",
    fromCurrency: "USD",
    toCurrency: "USDC",
  })
  const [plaidHandler, setPlaidHandler] = useState<any>(null)
  const [customerId, setCustomerId] = useState("")

  useEffect(() => {
    if (step === 3 && isConnected && address) {
      setStep(4)
    }
  }, [step, isConnected, address])

  useEffect(() => {
    if (step === 3 && customerId) {
      initializePlaidLink()
    }
  }, [step, customerId])

  const initializePlaidLink = async () => {
    try {
      // Create workflow to get Plaid link token
      const workflowResponse = await fetch("/api/cybrid/create-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      })

      const { plaidLinkToken } = await workflowResponse.json()

      // Initialize Plaid Link
      const handler = (window as any).Plaid.create({
        token: plaidLinkToken,
        onSuccess: async (publicToken: string, metadata: any) => {
          await handleBankAccountConnection(publicToken, metadata)
        },
        onExit: (err: any, metadata: any) => {
          console.log("Plaid Link exited:", err, metadata)
        },
      })

      setPlaidHandler(handler)
    } catch (error) {
      console.error("Error initializing Plaid:", error)
    }
  }

  const handleBankAccountConnection = async (publicToken: string, metadata: any) => {
    try {
      setLoading(true)

      const response = await fetch("/api/cybrid/create-bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          plaidPublicToken: publicToken,
          accountId: metadata.accounts[0].id,
          metadata,
        }),
      })

      if (response.ok) {
        setStep(4)
      }
    } catch (error) {
      console.error("Error connecting bank account:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePersonalDetailsSubmit = async () => {
    try {
      setLoading(true)

      // Create customers in both Cybrid and Sphere
      const [cybridResponse, sphereResponse] = await Promise.all([
        fetch("/api/cybrid/create-customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "current-user", personalDetails }),
        }),
        fetch("/api/sphere/create-customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "current-user", personalDetails }),
        }),
      ])

      const cybridData = await cybridResponse.json()
      const sphereData = await sphereResponse.json()

      if (cybridData.success && sphereData.success) {
        setCustomerId(cybridData.cybridCustomerId)
        setStep(2)
      }
    } catch (error) {
      console.error("Error creating customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWalletConnect = async (walletId: string, walletAddress: string) => {
    try {
      // Save wallet address for current user
      await fetch("/api/wallet/save-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user", // Replace with actual user ID
          walletAddress,
          network: "ethereum",
          isPrimary: true,
        }),
      })

      toast.success("Wallet connected successfully")
      setStep(4)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast.error("Failed to connect wallet")
    }
  }

  const handleTransferSubmit = async () => {
    if (!address) {
      toast.error("Please connect your wallet first")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/sphere/create-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          ...transferDetails,
          walletAddress: address, // Use connected wallet address
        }),
      })

      if (response.ok) {
        setStep(5)
      }
    } catch (error) {
      console.error("Error creating transfer:", error)
      toast.error("Failed to create transfer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js" async />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i}
                </div>
                {i < 5 && <div className={`w-12 h-0.5 mx-2 ${i < step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>We need to verify your identity for compliance and security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={personalDetails.firstName}
                      onChange={(e) => setPersonalDetails((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={personalDetails.lastName}
                      onChange={(e) => setPersonalDetails((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalDetails.email}
                    onChange={(e) => setPersonalDetails((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={personalDetails.phoneNumber}
                    onChange={(e) => setPersonalDetails((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={personalDetails.address}
                    onChange={(e) => setPersonalDetails((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={personalDetails.city}
                      onChange={(e) => setPersonalDetails((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={personalDetails.state}
                      onChange={(e) => setPersonalDetails((prev) => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={personalDetails.zipCode}
                      onChange={(e) => setPersonalDetails((prev) => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={personalDetails.dateOfBirth}
                    onChange={(e) => setPersonalDetails((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>

                <Button onClick={handlePersonalDetailsSubmit} disabled={loading} className="w-full">
                  {loading ? "Creating Account..." : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: KYC Verification */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
                <CardDescription>Complete KYC verification to enable crypto transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Badge variant="secondary" className="mb-4">
                    KYC Required
                  </Badge>
                  <p className="text-muted-foreground mb-6">
                    You'll be redirected to our secure identity verification partner.
                  </p>
                  <Button onClick={() => setStep(3)}>
                    Complete Verification
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Wallet Connection */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Connect Your Wallet
                </CardTitle>
                <CardDescription>Connect your crypto wallet to receive your purchased cryptocurrency.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <WalletConnectButton onConnect={handleWalletConnect} />

                  {isConnected && address && (
                    <div className="text-center">
                      <Button onClick={() => setStep(4)}>
                        Continue with Connected Wallet
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Transfer Setup */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Setup Crypto Purchase
                </CardTitle>
                <CardDescription>Configure your fiat-to-crypto conversion.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100.00"
                      value={transferDetails.amount}
                      onChange={(e) => setTransferDetails((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromCurrency">From Currency</Label>
                    <Select
                      value={transferDetails.fromCurrency}
                      onValueChange={(value) => setTransferDetails((prev) => ({ ...prev, fromCurrency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="toCurrency">To Cryptocurrency</Label>
                  <Select
                    value={transferDetails.toCurrency}
                    onValueChange={(value) => setTransferDetails((prev) => ({ ...prev, toCurrency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">Bitcoin</SelectItem>
                      <SelectItem value="ETH">Ethereum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {address && (
                  <div>
                    <Label>Destination Wallet</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-mono text-sm">{address}</p>
                      <p className="text-xs text-muted-foreground mt-1">Connected wallet address</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Purchase Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>
                        {transferDetails.amount} {transferDetails.fromCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>You'll receive:</span>
                      <span>
                        ~{transferDetails.amount} {transferDetails.toCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Network fee:</span>
                      <span>~$2.50</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleTransferSubmit} disabled={loading || !address} className="w-full">
                  {loading ? "Processing..." : "Purchase Crypto"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Transfer Initiated
                </CardTitle>
                <CardDescription>Your fiat-to-crypto transfer has been successfully created.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg mb-6">
                    <p className="text-green-800 dark:text-green-200">
                      Your transfer is being processed. You'll receive your crypto within 1-3 business days.
                    </p>
                  </div>
                  <Button onClick={() => (window.location.href = "/dashboard")}>Go to Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
