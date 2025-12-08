"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Clock, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface XAIGateCheckoutProps {
  amount: number
  orderId?: string
  description?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function XAIGateCheckout({ amount, orderId, description, onSuccess, onCancel }: XAIGateCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState<any>(null)
  const [status, setStatus] = useState<"pending" | "confirming" | "completed" | "expired" | "failed">("pending")
  const [timeRemaining, setTimeRemaining] = useState<number>(900) // 15 minutes

  useEffect(() => {
    if (payment && status === "pending") {
      // Poll for payment status every 5 seconds
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/xaigate/payment-status?paymentId=${payment.id}`)
          const data = await response.json()

          if (data.success) {
            setStatus(data.status.status)

            if (data.status.status === "completed") {
              clearInterval(interval)
              toast.success("Payment confirmed!")
              onSuccess?.()
            } else if (data.status.status === "expired" || data.status.status === "failed") {
              clearInterval(interval)
              toast.error("Payment failed or expired")
            }
          }
        } catch (error) {
          console.error("[v0] Failed to check payment status:", error)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [payment, status, onSuccess])

  useEffect(() => {
    if (payment && status === "pending") {
      // Countdown timer
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setStatus("expired")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [payment, status])

  const createPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/xaigate/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          orderId,
          description,
          network: "1", // Ethereum - fast and low fees with USDC
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPayment(data.payment)
        setStatus(data.payment.status)
        toast.success("Payment request created!")
      } else {
        toast.error(data.error || "Failed to create payment")
      }
    } catch (error) {
      console.error("[v0] Payment creation error:", error)
      toast.error("Failed to create payment")
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    if (payment?.address) {
      navigator.clipboard.writeText(payment.address)
      toast.success("Address copied to clipboard!")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!payment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pay with Crypto</CardTitle>
          <CardDescription>Fast, secure USDC payment on Ethereum and other supported networks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold">$0.00</p>
            <p className="text-sm text-muted-foreground">Test payment - Gasless transaction (no fees)</p>
          </div>

          <Button onClick={createPayment} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Payment...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>

          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Scan to Pay</CardTitle>
          <Badge
            variant={
              status === "completed"
                ? "default"
                : status === "failed" || status === "expired"
                  ? "destructive"
                  : "secondary"
            }
          >
            {status === "pending" && <Clock className="mr-1 h-3 w-3" />}
            {status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
            {(status === "failed" || status === "expired") && <XCircle className="mr-1 h-3 w-3" />}
            {status.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          {status === "pending" && `Time remaining: ${formatTime(timeRemaining)}`}
          {status === "confirming" && "Waiting for blockchain confirmation..."}
          {status === "completed" && "Payment confirmed!"}
          {status === "expired" && "Payment expired"}
          {status === "failed" && "Payment failed"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "pending" && (
          <>
            <div className="bg-white p-4 rounded-lg border-2 border-primary">
              <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                {/* QR Code would be rendered here */}
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">QR Code</p>
                  <p className="text-xs text-muted-foreground">Scan with your wallet</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">
                  {payment.amount} {payment.currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium capitalize">{payment.network}</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Payment Address:</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted p-2 rounded overflow-x-auto">{payment.address}</code>
                  <Button size="sm" variant="outline" onClick={copyAddress}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                • Send exactly {payment.amount} {payment.currency} to the address above
              </p>
              <p>• Payment will be confirmed in ~5 seconds</p>
              <p>• Do not close this window until payment is confirmed</p>
            </div>
          </>
        )}

        {status === "confirming" && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <p className="font-medium">Confirming payment...</p>
              <p className="text-sm text-muted-foreground">This usually takes 5-10 seconds</p>
            </div>
          </div>
        )}

        {status === "completed" && (
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <p className="font-medium text-lg">Payment Confirmed!</p>
              <p className="text-sm text-muted-foreground">Your PUFF tokens have been credited</p>
            </div>
            {payment.txHash && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://etherscan.io/tx/${payment.txHash}`} target="_blank" rel="noopener noreferrer">
                  View Transaction <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        )}

        {(status === "expired" || status === "failed") && (
          <div className="text-center space-y-4 py-8">
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <div>
              <p className="font-medium text-lg">{status === "expired" ? "Payment Expired" : "Payment Failed"}</p>
              <p className="text-sm text-muted-foreground">
                {status === "expired" ? "Please create a new payment" : "Please try again"}
              </p>
            </div>
            <Button
              onClick={() => {
                setPayment(null)
                setStatus("pending")
                setTimeRemaining(900)
              }}
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
