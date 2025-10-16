"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Wallet, Mail, ArrowRight, Shield, Zap, CreditCard } from "lucide-react"

export default function OnboardPage() {
  const [onboardingStep, setOnboardingStep] = useState<"method" | "wallet" | "email" | "complete">("method")
  const [walletAddress, setWalletAddress] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signupError, setSignupError] = useState("")
  const [wagmiHooks, setWagmiHooks] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadWagmi = async () => {
      try {
        const wagmi = await import("wagmi")
        setWagmiHooks(wagmi)
      } catch (error) {
        console.error("[v0] Failed to load wagmi:", error)
      }
    }
    loadWagmi()
  }, [])

  useEffect(() => {
    if (onboardingStep === "complete") {
      console.log("[v0] Onboarding complete, redirecting to customer dashboard in 2 seconds...")
      const redirectTimer = setTimeout(() => {
        window.location.href = "/customer"
      }, 2000)

      return () => clearTimeout(redirectTimer)
    }
  }, [onboardingStep])

  const handleWalletConnect = async () => {
    if (isConnecting) {
      console.log("[v0] Connection already in progress, ignoring duplicate request")
      return
    }

    setIsConnecting(true)
    console.log("[v0] Starting wallet connection...")

    try {
      if (wagmiHooks && typeof window !== "undefined") {
        // Wait a bit for wagmi to be ready
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      if (typeof window !== "undefined" && (window as any).ethereum) {
        console.log("[v0] Requesting accounts from ethereum provider...")
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts.length > 0) {
          const address = accounts[0]
          console.log("[v0] Wallet connected:", address)
          setWalletAddress(address)

          // Save wallet address to backend
          const response = await fetch("/api/wallet/save-address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          })

          if (response.ok) {
            const result = await response.json()

            // Check if this is a trusted wallet (trustee)
            if (result.isTrustee) {
              // Redirect to trustee dashboard
              window.location.href = "/trustee"
              return
            }
          }

          setOnboardingStep("complete")
        }
      } else {
        // Fallback for demo
        console.log("[v0] No ethereum provider, using demo address")
        const demoAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e"
        setWalletAddress(demoAddress)
        setOnboardingStep("complete")
      }
    } catch (error: any) {
      if (error.message?.includes("already pending")) {
        console.log("[v0] Wallet connection request already pending, please wait...")
      } else {
        console.error("[v0] Wallet connection failed:", error)
      }
    } finally {
      setTimeout(() => {
        setIsConnecting(false)
      }, 1000)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningUp(true)
    setSignupError("")

    try {
      // Call the registration API to create user with embedded wallet
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0], // Use email prefix as name for now
          email: email.trim().toLowerCase(),
          password: Math.random().toString(36).slice(-12), // Generate random password for email-only signup
          role: "customer",
          phone: phone.trim(),
        }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Response is not JSON:", contentType)
        const text = await response.text()
        console.error("[v0] Response text:", text.substring(0, 200))
        setSignupError("Server error. Please try again later.")
        return
      }

      const data = await response.json()

      if (data.success) {
        // Set the embedded wallet address from the response
        if (data.user?.embedded_wallet) {
          setWalletAddress(data.user.embedded_wallet)
        }
        setOnboardingStep("complete")
      } else {
        setSignupError(data.error || "Failed to create account. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Email signup error:", error)
      setSignupError("Network error. Please try again.")
    } finally {
      setIsSigningUp(false)
    }
  }

  if (onboardingStep === "complete") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Welcome to PuffPass!</CardTitle>
            <CardDescription>Your account is ready. You can now start using cannabis payments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletAddress && (
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">
                  {walletAddress.startsWith("0x") ? "Connected Wallet" : "Embedded Wallet"}
                </Label>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            )}
            <div className="text-center space-y-2">
              <div className="animate-pulse text-sm text-muted-foreground">Redirecting to your dashboard...</div>
              <div className="w-full bg-muted rounded-full h-1">
                <div className="bg-primary h-1 rounded-full animate-[width_2s_ease-in-out]" style={{ width: "100%" }} />
              </div>
            </div>
            <Button className="w-full" asChild>
              <a href="/customer">Continue to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg">PuffPass</span>
            </div>
            <Badge variant="secondary">Cannabis Payments</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="w-16 h-0.5 bg-border"></div>
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
            </div>
          </div>

          {onboardingStep === "method" && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-balance">Get started with PuffPass</h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Choose how you'd like to create your cannabis payment account
                </p>
              </div>

              <Tabs defaultValue="wallet" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="wallet">Connect Wallet</TabsTrigger>
                  <TabsTrigger value="email">Email & Phone</TabsTrigger>
                </TabsList>

                <TabsContent value="wallet" className="space-y-6">
                  <Card className="card-hover">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Connect Your Wallet</CardTitle>
                          <CardDescription>Use your existing crypto wallet for instant setup</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-success" />
                          <span>Instant setup</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-success" />
                          <span>Secure connection</span>
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleWalletConnect} disabled={isConnecting}>
                        {isConnecting ? (
                          <>
                            <span className="animate-pulse">Connecting...</span>
                          </>
                        ) : (
                          <>
                            Connect Wallet
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      {isConnecting && (
                        <p className="text-xs text-muted-foreground text-center">
                          Please check your wallet for the connection request
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-6">
                  <Card className="card-hover">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-info" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Email & Phone Setup</CardTitle>
                          <CardDescription>
                            Create account with email - we'll create a secure wallet for you
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleEmailSignup} className="space-y-4">
                        {signupError && (
                          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{signupError}</div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSigningUp}>
                          {isSigningUp ? "Creating Account..." : "Create Account"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <div className="text-xs text-muted-foreground text-center p-2 bg-muted rounded">
                          A secure embedded wallet will be created automatically for your account
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-4 pt-8">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
                    <CreditCard className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="font-medium">Instant Payments</h3>
                  <p className="text-sm text-muted-foreground">Pay with PUFF tokens instantly</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
                    <Zap className="w-6 h-6 text-warning" />
                  </div>
                  <h3 className="font-medium">Earn Rewards</h3>
                  <p className="text-sm text-muted-foreground">Get Puff Points on every purchase</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 text-info" />
                  </div>
                  <h3 className="font-medium">Secure & Compliant</h3>
                  <p className="text-sm text-muted-foreground">Bank-grade security</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
