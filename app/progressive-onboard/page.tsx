"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import {
  Wallet,
  Mail,
  ArrowRight,
  Shield,
  Zap,
  CreditCard,
  CheckCircle,
  Phone,
  Lock,
  Star,
  Users,
  TrendingUp,
  Smartphone,
} from "lucide-react"
import { useAccount } from "wagmi"
import { toast } from "sonner"

type OnboardingStep = "landing" | "method" | "wallet-connect" | "email-phone" | "verification" | "complete"
type OnboardingPath = "wallet" | "email" | null

export default function ProgressiveOnboardPage() {
  const [step, setStep] = useState<OnboardingStep>("landing")
  const [path, setPath] = useState<OnboardingPath>(null)
  const [loading, setLoading] = useState(false)
  const { address, isConnected } = useAccount()

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    verificationCode: "",
  })

  // Auto-advance wallet connect flow
  useEffect(() => {
    if (step === "wallet-connect" && isConnected && address) {
      setTimeout(() => setStep("complete"), 1000)
    }
  }, [step, isConnected, address])

  const handleMethodSelect = (selectedPath: OnboardingPath) => {
    setPath(selectedPath)
    if (selectedPath === "wallet") {
      setStep("wallet-connect")
    } else {
      setStep("email-phone")
    }
  }

  const handleEmailPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setStep("verification")
      toast.success("Verification code sent!")
    }, 1500)
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate verification
    setTimeout(() => {
      setLoading(false)
      setStep("complete")
      toast.success("Account verified successfully!")
    }, 1500)
  }

  const handleWalletConnect = (walletId: string, walletAddress: string) => {
    toast.success(`${walletId} wallet connected successfully`)
    setTimeout(() => setStep("complete"), 1000)
  }

  // Landing Page
  if (step === "landing") {
    return (
      <div className="min-h-screen hero-gradient">
        {/* Header */}
        <header className="border-b border-border/20 bg-card/10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-lg">P</span>
                </div>
                <span className="font-bold text-xl text-foreground">Puff Pass</span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="trust-badge">
                  <Shield className="w-3 h-3" />
                  Secure by Design
                </Badge>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="security-indicator">
                    <Lock className="w-4 h-4" />
                    Bank-Grade Security
                  </Badge>
                  <h1 className="text-5xl font-bold text-balance leading-tight">
                    Cannabis payments{" "}
                    <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                      without the middleman
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                    The self-custody platform that brings the best of crypto directly to cannabis commerce. Pay
                    instantly, earn rewards, stay compliant.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="primary-gradient shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                    onClick={() => setStep("method")}
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button variant="outline" size="lg" className="border-border/50 bg-transparent">
                    Learn More
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-success/20 border-2 border-background rounded-full flex items-center justify-center"
                        >
                          <Users className="w-4 h-4 text-success" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">10,000+ users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="text-sm text-muted-foreground">4.9/5 rating</span>
                  </div>
                </div>
              </div>

              {/* Mobile Mockup */}
              <div className="relative">
                <div className="mobile-mockup">
                  <div className="absolute inset-4 bg-background rounded-2xl overflow-hidden">
                    {/* Mock app interface */}
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Puff Pass Balance</div>
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">$401.84K</div>
                        <div className="flex items-center space-x-2 text-sm text-success">
                          <TrendingUp className="w-4 h-4" />
                          <span>+2.5% this week</span>
                        </div>
                      </div>
                      <div className="h-24 bg-success/10 rounded-lg flex items-end p-2">
                        <div className="w-full h-16 bg-gradient-to-t from-success/50 to-success/20 rounded"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" className="success-gradient">
                          Pay
                        </Button>
                        <Button size="sm" variant="outline">
                          Transfer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-success/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="feature-grid">
              <div className="feature-item">
                <div className="w-12 h-12 success-gradient rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <CreditCard className="w-6 h-6 text-success-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Instant Payments</h3>
                <p className="text-muted-foreground text-sm">
                  Pay with PUFF tokens instantly at any participating dispensary
                </p>
              </div>
              <div className="feature-item">
                <div className="w-12 h-12 bg-warning/10 border border-warning/20 rounded-xl flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-semibold text-lg">Earn Rewards</h3>
                <p className="text-muted-foreground text-sm">
                  Get Puff Points on every purchase and unlock exclusive benefits
                </p>
              </div>
              <div className="feature-item">
                <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Secure & Compliant</h3>
                <p className="text-muted-foreground text-sm">Bank-grade security with full regulatory compliance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Method Selection
  if (step === "method") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">P</span>
                </div>
                <span className="font-semibold text-lg">Puff Pass</span>
              </div>
              <Badge className="trust-badge">
                <Shield className="w-3 h-3" />
                Your funds never leave Puff Pass
              </Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-4">
                <div className="onboard-step active">1</div>
                <div className="onboard-connector pending w-16"></div>
                <div className="onboard-step pending">2</div>
                <div className="onboard-connector pending w-16"></div>
                <div className="onboard-step pending">3</div>
              </div>
            </div>

            <div className="text-center space-y-6 mb-12">
              <h1 className="text-4xl font-bold text-balance">Choose your path to Puff Pass</h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                We support both crypto-native users and mainstream users with the same secure experience
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Wallet Connect Path */}
              <div
                className={`method-card ${path === "wallet" ? "selected" : ""}`}
                onClick={() => handleMethodSelect("wallet")}
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 primary-gradient rounded-2xl flex items-center justify-center shadow-lg">
                      <Wallet className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Connect Wallet</h3>
                      <p className="text-muted-foreground">For crypto-native users</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm">Instant setup with wallet signature</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm">Full self-custody control</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm">No additional verification needed</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Recommended for crypto users
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Email & Phone Path */}
              <div
                className={`method-card ${path === "email" ? "selected" : ""}`}
                onClick={() => handleMethodSelect("email")}
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 success-gradient rounded-2xl flex items-center justify-center shadow-lg">
                      <Mail className="w-7 h-7 text-success-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Email & Phone</h3>
                      <p className="text-muted-foreground">For mainstream users</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm">Embedded wallet created automatically</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm">Email & SMS verification</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm">Easy account recovery</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      Perfect for beginners
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground">
                Both paths provide the same secure, fee-free payment experience
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Wallet Connect Flow
  if (step === "wallet-connect") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg">Puff Pass</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-4">
                <div className="onboard-step completed">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="onboard-connector active w-16"></div>
                <div className="onboard-step active">2</div>
                <div className="onboard-connector pending w-16"></div>
                <div className="onboard-step pending">3</div>
              </div>
            </div>

            <Card className="card-gradient border-primary/20">
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Wallet className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
                <CardDescription className="text-lg">
                  Sign with your wallet to verify ownership and create your Puff Pass account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="security-indicator w-full justify-center">
                  <Shield className="w-4 h-4" />
                  Your wallet is verified and secure
                </div>

                <WalletConnectButton onConnect={handleWalletConnect} />

                {isConnected && address && (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Wallet Connected Successfully!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
                  </div>
                )}

                <div className="text-center">
                  <Button variant="ghost" onClick={() => setStep("method")} className="text-muted-foreground">
                    ← Back to method selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Email & Phone Flow
  if (step === "email-phone") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg">Puff Pass</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-4">
                <div className="onboard-step completed">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="onboard-connector active w-16"></div>
                <div className="onboard-step active">2</div>
                <div className="onboard-connector pending w-16"></div>
                <div className="onboard-step pending">3</div>
              </div>
            </div>

            <Card className="card-gradient border-success/20">
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 success-gradient rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Mail className="w-8 h-8 text-success-foreground" />
                </div>
                <CardTitle className="text-2xl">Create Your Account</CardTitle>
                <CardDescription className="text-lg">
                  We'll create a secure embedded wallet for you automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailPhoneSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="security-indicator w-full justify-center">
                    <Lock className="w-4 h-4" />
                    Your Puff Pass wallet is ready
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 success-gradient shadow-lg shadow-success/25"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("method")}
                      className="text-muted-foreground"
                    >
                      ← Back to method selection
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Verification Step
  if (step === "verification") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg">Puff Pass</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-4">
                <div className="onboard-step completed">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="onboard-connector active w-16"></div>
                <div className="onboard-step completed">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="onboard-connector active w-16"></div>
                <div className="onboard-step active">3</div>
              </div>
            </div>

            <Card className="card-gradient border-warning/20">
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 bg-warning/10 border border-warning/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Phone className="w-8 h-8 text-warning" />
                </div>
                <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
                <CardDescription className="text-lg">
                  Enter the verification code sent to {formData.phone}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerificationSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium">
                      Verification Code
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={formData.verificationCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, verificationCode: e.target.value }))}
                      required
                      className="h-12 text-center text-lg font-mono"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 primary-gradient shadow-lg shadow-primary/25"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify & Complete Setup"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <div className="text-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      Resend code
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Success/Complete Step
  if (step === "complete") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg">Puff Pass</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="card-gradient border-success/20">
              <CardHeader className="text-center space-y-6">
                <div className="w-20 h-20 success-gradient rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle className="w-10 h-10 text-success-foreground" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl">Welcome to Puff Pass!</CardTitle>
                  <CardDescription className="text-lg">
                    Your account is ready. Start making cannabis payments instantly.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Account Summary */}
                <div className="space-y-4">
                  {path === "wallet" && address && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Wallet className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Wallet Verified</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {path === "email" && (
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-success" />
                        <div>
                          <p className="font-medium text-sm">Embedded Wallet Created</p>
                          <p className="text-xs text-muted-foreground">Secure wallet linked to {formData.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="trust-badge w-full justify-center">
                    <Shield className="w-4 h-4" />
                    Your payments are always free
                  </div>
                </div>

                <Separator />

                {/* Next Steps */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-center">What's Next?</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="text-sm">Find participating dispensaries</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <Zap className="w-5 h-5 text-warning" />
                      <span className="text-sm">Start earning Puff Points</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <Smartphone className="w-5 h-5 text-success" />
                      <span className="text-sm">Download the mobile app</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 primary-gradient shadow-lg shadow-primary/25" asChild>
                  <a href="/customer">
                    Continue to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return null
}
