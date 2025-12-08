"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, QrCode } from "lucide-react"
import { toast } from "sonner"

interface XAIGatePOSProps {
  onPaymentComplete?: (paymentId: string, amount: number) => void
}

export function XAIGatePOS({ onPaymentComplete }: XAIGatePOSProps) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState<any>(null)
  const [status, setStatus] = useState<"idle" | "pending" | "completed">("idle")

  const createPOSPayment = async () => {
    const amountNum = Number.parseFloat(amount)

    if (!amountNum || amountNum < 1) {
      toast.error("Please enter a valid amount")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/xaigate/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          orderId: `POS-${Date.now()}`,
          description: `In-store purchase - $${amountNum}`,
          network: "solana",
          metadata: {
            type: "pos",
            location: "retail",
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPayment(data.payment)
        setStatus("pending")
        toast.success("Payment QR generated!")

        // Start polling for payment status
        pollPaymentStatus(data.payment.id)
      } else {
        toast.error(data.error || "Failed to create payment")
      }
    } catch (error) {
      console.error("[v0] POS payment creation error:", error)
      toast.error("Failed to create payment")
    } finally {
      setLoading(false)
    }
  }

  const pollPaymentStatus = async (paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/xaigate/payment-status?paymentId=${paymentId}`)
        const data = await response.json()

        if (data.success && data.status.status === "completed") {
          clearInterval(interval)
          setStatus("completed")
          toast.success("Payment received!")

          setTimeout(() => {
            onPaymentComplete?.(paymentId, Number.parseFloat(amount))
            resetPOS()
          }, 2000)
        }
      } catch (error) {
        console.error("[v0] Failed to check payment status:", error)
      }
    }, 3000) // Poll every 3 seconds for faster POS experience

    // Stop polling after 15 minutes
    setTimeout(() => clearInterval(interval), 900000)
  }

  const resetPOS = () => {
    setAmount("")
    setPayment(null)
    setStatus("idle")
  }

  if (status === "idle") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Point of Sale</CardTitle>
          <CardDescription>Enter amount to generate payment QR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              className="text-2xl h-16"
            />
          </div>

          <Button onClick={createPOSPayment} disabled={loading || !amount} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating QR...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Generate Payment QR
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === "pending") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Payment</CardTitle>
            <Badge variant="secondary">Waiting for Payment</Badge>
          </div>
          <CardDescription>Customer should scan QR with their wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold">${payment.amount}</p>
            <p className="text-sm text-muted-foreground">USDC on Solana</p>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-primary">
            <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
              {/* QR Code would be rendered here */}
              <div className="text-center space-y-2">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Scan to Pay</p>
                <p className="text-xs text-muted-foreground">{payment.amount} USDC</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Waiting for customer payment...</p>
          </div>

          <Button onClick={resetPOS} variant="outline" className="w-full bg-transparent">
            Cancel Payment
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === "completed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Complete</CardTitle>
          <CardDescription>Transaction confirmed on blockchain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <div>
              <p className="text-3xl font-bold">${payment.amount}</p>
              <p className="text-sm text-muted-foreground">Payment Received</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
