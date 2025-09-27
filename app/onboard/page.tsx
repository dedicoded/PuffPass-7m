"use client"

import type React from "react"

import { useState } from "react"
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

  const handleWalletConnect = async () => {
    setIsConnecting(true)
    // Simulate wallet connection
    setTimeout(() => {
      setWalletAddress("0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e")
      setOnboardingStep("complete")
      setIsConnecting(false)
    }, 2000)
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setOnboardingStep("complete")
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
                <Label className="text-sm font-medium">Connected Wallet</Label>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            )}
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
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
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
                          <CardDescription>Create account with email and phone verification</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleEmailSignup} className="space-y-4">
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
                        <Button type="submit" className="w-full">
                          Create Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
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
