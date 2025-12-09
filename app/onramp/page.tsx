"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Coins, AlertCircle } from "lucide-react"
import { PolygonPayment } from "@/components/polygon-payment"

const PUFFPASS_TREASURY = process.env.NEXT_PUBLIC_PUFFPASS_TREASURY_ADDRESS || ""

export default function OnrampPage() {
  const [step, setStep] = useState<"select" | "payment" | "complete">("select")
  const [userId, setUserId] = useState<string | null>(null)
  const [userWallet, setUserWallet] = useState<string | null>(null)

  useEffect(() => {
    fetchUserSession()
  }, [])

  const fetchUserSession = async () => {
    console.log("[v0] Fetching user session for onramp...")
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] User session data:", data)
        if (data.user?.id) {
          setUserId(data.user.id)
        }
        if (data.user?.walletAddress) {
          setUserWallet(data.user.walletAddress)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user session:", error)
    }
  }

  const handleMethodSelect = () => {
    console.log("[v0] Payment method selected, moving to payment step")
    setStep("payment")
  }

  const handlePaymentSuccess = () => {
    console.log("[v0] Payment successful, moving to complete step")
    setStep("complete")
  }

  const handlePaymentCancel = () => {
    console.log("[v0] Payment cancelled, returning to select step")
    setStep("select")
  }

  const getRecipientAddress = () => {
    // For "Add Funds", we send to the treasury which credits the user's account
    // The treasury address should be configured
    if (PUFFPASS_TREASURY) {
      return PUFFPASS_TREASURY
    }
    // Fallback to user's wallet if they have one
    if (userWallet) {
      return userWallet
    }
    // Return empty string to trigger the "not configured" warning
    return ""
  }

  const recipientAddress = getRecipientAddress()
  const isConfigured = !!recipientAddress && !!process.env.NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS

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
                  step === "payment"
                    ? "bg-primary text-primary-foreground"
                    : step === "complete"
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step === "complete" ? <CheckCircle className="w-4 h-4" /> : "2"}
              </div>
            </div>
          </div>

          {step === "select" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Add Funds to Your Account</h1>
                <p className="text-lg text-muted-foreground">Powered by PuffPassRouter - Gasless Crypto Payments</p>
              </div>

              {!isConfigured && (
                <div className="max-w-md mx-auto">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-600">Setup Required</p>
                        <p className="text-muted-foreground mt-1">
                          The payment system requires configuration. Please ensure the following environment variables
                          are set:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-xs text-muted-foreground">
                          <li>NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS</li>
                          <li>NEXT_PUBLIC_PUFFPASS_TREASURY_ADDRESS</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-w-md mx-auto space-y-4">
                <Card className="card-hover cursor-pointer" onClick={handleMethodSelect}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Coins className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">Polygon USDC Payments</CardTitle>
                        <CardDescription>Fast USDC payments on Polygon (~5 seconds, ~$0.01 fees)</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <div className="text-center text-sm text-muted-foreground">
                  <p>✓ Self-hosted & open-source</p>
                  <p>✓ No KYC required</p>
                  <p>✓ 3% platform fee + gasless merchant settlements</p>
                </div>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Complete Your Payment</h1>
                <p className="text-muted-foreground">Connect your wallet and pay with USDC on Polygon</p>
              </div>

              <PolygonPayment
                merchantAddress={recipientAddress}
                orderId={`onramp_${userId || "guest"}_${Date.now()}`}
                description="Add funds to PuffPass account"
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setStep("select")}>
                  Back to Payment Methods
                </Button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-success-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-lg text-muted-foreground">Your funds have been added to your account</p>
              </div>
              <Button asChild>
                <Link href="/customer">Go to Dashboard</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
