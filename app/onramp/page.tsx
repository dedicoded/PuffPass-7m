"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Building2, ArrowRight, DollarSign, Shield, Clock, CheckCircle } from "lucide-react"

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  processingTime: string
  fees: string
  limits: string
  popular?: boolean
  enabled: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cybrid",
    name: "Cybrid Banking",
    icon: <CreditCard className="w-6 h-6 text-blue-600" />,
    description: "Crypto-native banking with instant settlement",
    processingTime: "Instant",
    fees: "1.5%",
    limits: "$50 - $50,000",
    popular: true,
    enabled: true,
  },
  {
    id: "sphere",
    name: "Sphere Pay",
    icon: (
      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
        S
      </div>
    ),
    description: "Direct crypto-to-PUFF conversion",
    processingTime: "1-2 minutes",
    fees: "0.8%",
    limits: "$100 - $25,000",
    popular: true,
    enabled: true,
  },
  {
    id: "apple-pay",
    name: "Apple Pay",
    icon: (
      <div className="w-6 h-6 bg-black rounded text-white flex items-center justify-center text-xs font-bold"></div>
    ),
    description: "Instant payment with Touch ID or Face ID",
    processingTime: "Instant",
    fees: "2.9%",
    limits: "$500 - $10,000",
    popular: false,
    enabled: false, // TODO: Enable when Apple Pay is configured
  },
  {
    id: "cash-app",
    name: "Cash App",
    icon: <div className="w-6 h-6 bg-green-500 rounded text-white flex items-center justify-center text-xs">$</div>,
    description: "Send money directly from Cash App",
    processingTime: "1-3 minutes",
    fees: "1.5%",
    limits: "$100 - $7,500",
    popular: false,
    enabled: false, // TODO: Enable when Cash App is configured
  },
  {
    id: "zelle",
    name: "Zelle",
    icon: <Building2 className="w-6 h-6 text-purple-600" />,
    description: "Bank-to-bank transfer via Zelle",
    processingTime: "5-15 minutes",
    fees: "0.5%",
    limits: "$1,000 - $25,000",
    enabled: false, // TODO: Enable when Zelle is configured
  },
  {
    id: "venmo",
    name: "Venmo",
    icon: (
      <div className="w-6 h-6 bg-blue-500 rounded text-white flex items-center justify-center text-xs font-bold">V</div>
    ),
    description: "Pay with your Venmo balance",
    processingTime: "2-5 minutes",
    fees: "2.5%",
    limits: "$100 - $5,000",
    enabled: false, // TODO: Enable when Venmo is configured
  },
  {
    id: "bank-transfer",
    name: "Bank Transfer",
    icon: <Building2 className="w-6 h-6 text-blue-600" />,
    description: "Direct ACH transfer from your bank",
    processingTime: "1-3 business days",
    fees: "0.8%",
    limits: "$500 - $50,000",
    enabled: false, // TODO: Enable when ACH is configured
  },
]

export default function OnrampPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [step, setStep] = useState<"select" | "amount" | "payment" | "complete">("select")
  const [paymentResult, setPaymentResult] = useState<{ amountUsd: number; puffAmount: number } | null>(null)

  const selectedPaymentMethod = paymentMethods.find((method) => method.id === selectedMethod)
  const usdAmount = Number.parseFloat(amount) || 0
  const puffAmount = usdAmount * 0.95 // 5% conversion fee
  const fees = selectedPaymentMethod
    ? (usdAmount * Number.parseFloat(selectedPaymentMethod.fees.replace("%", ""))) / 100
    : 0

  const handleMethodSelect = (methodId: string) => {
    const method = paymentMethods.find((m) => m.id === methodId)
    if (!method?.enabled) {
      alert("This payment method is coming soon!")
      return
    }
    setSelectedMethod(methodId)
    setStep("amount")
  }

  const handleAmountSubmit = () => {
    if (usdAmount >= 1) {
      // Minimum $1
      setStep("payment")
    }
  }

  const handlePaymentSuccess = (result: { amountUsd: number; puffAmount: number }) => {
    setPaymentResult(result)
    setStep("complete")
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
    // Error is already displayed in the payment form
  }

  const handleCryptoPayment = async () => {
    try {
      console.log("[v0] Starting payment processing for method:", selectedMethod)

      const userId = "user-placeholder-id" // TODO: Get from auth context

      if (selectedMethod === "cybrid") {
        const response = await fetch("/api/payments/cybrid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            amount: usdAmount,
            currency: "USD",
            walletAddress: "0x0000000000000000000000000000000000000000", // TODO: Get from connected wallet
          }),
        })

        if (!response.ok) {
          let errorMessage = "Cybrid payment failed"
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            try {
              const errorText = await response.text()
              errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
            } catch (textError) {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`
            }
          }
          throw new Error(errorMessage)
        }

        const result = await response.json()
        console.log("[v0] Cybrid payment successful:", result)

        if (result.mode === "test") {
          console.warn("[v0] Payment processed in TEST MODE - configure Cybrid API keys for live transactions")
        }

        const paymentResult = {
          amountUsd: usdAmount,
          puffAmount: puffAmount,
        }
        handlePaymentSuccess(paymentResult)
        return
      } else if (selectedMethod === "sphere") {
        const response = await fetch("/api/payments/sphere", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            amount: usdAmount,
            currency: "USD",
            walletAddress: "0x0000000000000000000000000000000000000000", // TODO: Get from connected wallet
          }),
        })

        if (!response.ok) {
          let errorMessage = "Sphere payment failed"
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            try {
              const errorText = await response.text()
              errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
            } catch (textError) {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`
            }
          }
          throw new Error(errorMessage)
        }

        const result = await response.json()
        console.log("[v0] Sphere payment successful:", result)

        if (result.mode === "test") {
          console.warn("[v0] Payment processed in TEST MODE - configure Sphere API keys for live transactions")
        }

        const paymentResult = {
          amountUsd: usdAmount,
          puffAmount: puffAmount,
        }
        handlePaymentSuccess(paymentResult)
        return
      }
    } catch (error) {
      console.error("[v0] Payment processing error:", error)
      handlePaymentError(error instanceof Error ? error.message : "Payment processing failed")
    }
  }

  if (step === "complete" && paymentResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Your PUFF tokens have been added to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="font-medium">${paymentResult.amountUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">PUFF Received</span>
                <span className="font-medium">{paymentResult.puffAmount.toFixed(2)} PUFF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium">{selectedPaymentMethod?.name}</span>
              </div>
            </div>
            <Button className="w-full" asChild>
              <a href="/customer">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg">PuffPass</span>
            </Link>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Add Funds
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "select" ? "bg-primary text-primary-foreground" : "bg-success text-success-foreground"
                }`}
              >
                {step === "select" ? "1" : <CheckCircle className="w-4 h-4" />}
              </div>
              <div className="w-16 h-0.5 bg-border"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "amount"
                    ? "bg-primary text-primary-foreground"
                    : step === "payment" || step === "complete"
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step === "payment" || step === "complete" ? <CheckCircle className="w-4 h-4" /> : "2"}
              </div>
              <div className="w-16 h-0.5 bg-border"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "payment"
                    ? "bg-primary text-primary-foreground"
                    : step === "complete"
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step === "complete" ? <CheckCircle className="w-4 h-4" /> : "3"}
              </div>
            </div>
          </div>

          {step === "select" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Add Funds to Your Account</h1>
                <p className="text-lg text-muted-foreground">Choose your preferred payment method</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`card-hover cursor-pointer relative ${!method.enabled ? "opacity-50" : ""}`}
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    {method.popular && method.enabled && (
                      <Badge className="absolute -top-2 -right-2 bg-primary">Popular</Badge>
                    )}
                    {!method.enabled && (
                      <Badge className="absolute -top-2 -right-2 bg-muted-foreground">Coming Soon</Badge>
                    )}
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        {method.icon}
                        <div>
                          <CardTitle className="text-lg">{method.name}</CardTitle>
                          <CardDescription>{method.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Time</span>
                          </div>
                          <p className="font-medium">{method.processingTime}</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <DollarSign className="w-3 h-3" />
                            <span>Fee</span>
                          </div>
                          <p className="font-medium">{method.fees}</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Shield className="w-3 h-3" />
                            <span>Limits</span>
                          </div>
                          <p className="font-medium text-xs">{method.limits}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === "amount" && selectedPaymentMethod && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Enter Amount</h1>
                <p className="text-muted-foreground">How much would you like to add?</p>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {selectedPaymentMethod.icon}
                    <div>
                      <CardTitle className="text-lg">{selectedPaymentMethod.name}</CardTitle>
                      <CardDescription>{selectedPaymentMethod.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="1.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10"
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum amount: $1.00</p>
                  </div>

                  {usdAmount >= 1 && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">You pay</span>
                        <span className="font-medium">${usdAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Processing fee</span>
                        <span className="font-medium">${fees.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">You receive</span>
                        <span className="font-medium text-lg">{puffAmount.toFixed(2)} PUFF</span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleAmountSubmit} disabled={usdAmount < 1} className="flex-1">
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === "payment" && selectedPaymentMethod && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Complete Payment</h1>
                <p className="text-muted-foreground">Secure crypto-native payment processing</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Review your transaction details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment Method</span>
                      <span className="font-medium">{selectedPaymentMethod.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="font-medium">${usdAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Processing Fee</span>
                      <span className="font-medium">${fees.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">PUFF Tokens</span>
                      <span className="font-bold">{puffAmount.toFixed(2)} PUFF</span>
                    </div>
                  </div>

                  <Button onClick={handleCryptoPayment} className="w-full">
                    Complete Payment
                  </Button>
                </CardContent>
              </Card>

              <Button variant="outline" onClick={() => setStep("amount")} className="w-full">
                Back to Amount
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
