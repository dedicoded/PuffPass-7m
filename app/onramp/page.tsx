"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ArrowRight, CheckCircle } from "lucide-react"
import { CybridProvider } from "@/components/cybrid-provider"
import { CybridTradeComponent } from "@/components/cybrid-trade-component"
import { CybridPriceList } from "@/components/cybrid-price-list"

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  enabled: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cybrid",
    name: "Cybrid Banking",
    icon: <CreditCard className="w-6 h-6 text-blue-600" />,
    description: "Crypto-native banking with instant settlement",
    enabled: true,
  },
]

export default function OnrampPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>("cybrid")
  const [step, setStep] = useState<"select" | "trade" | "complete">("select")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUserSession()
  }, [])

  const fetchUserSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        if (data.user?.id) {
          setUserId(data.user.id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch user session:", error)
    }
  }

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setStep("trade")
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
                  step === "trade"
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
                <p className="text-lg text-muted-foreground">Powered by Cybrid Banking</p>
              </div>

              <div className="max-w-md mx-auto">
                <Card className="card-hover cursor-pointer" onClick={() => handleMethodSelect("cybrid")}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">Cybrid Banking</CardTitle>
                        <CardDescription>Crypto-native banking with instant settlement</CardDescription>
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
              </div>
            </div>
          )}

          {step === "trade" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Buy Cryptocurrency</h1>
                <p className="text-muted-foreground">Powered by Cybrid Banking</p>
              </div>

              <CybridProvider>
                <div className="grid md:grid-cols-2 gap-6">
                  <CybridPriceList />
                  <CybridTradeComponent asset="BTC" fiat="USD" />
                </div>
              </CybridProvider>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setStep("select")}>
                  Back to Payment Methods
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
