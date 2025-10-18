"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Coins, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"

interface RedeemPuffCardProps {
  puffBalance: number
  onRedemptionComplete?: () => void
}

export function RedeemPuffCard({ puffBalance, onRedemptionComplete }: RedeemPuffCardProps) {
  const [redeemAmount, setRedeemAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const usdcAmount = redeemAmount ? Number.parseFloat(redeemAmount) / 100 : 0

  const handleRedeem = async () => {
    setError("")
    setSuccess(false)

    const amount = Number.parseFloat(redeemAmount)

    if (!amount || amount < 100) {
      setError("Minimum 100 PUFF required")
      return
    }

    if (amount % 100 !== 0) {
      setError("Amount must be multiple of 100 PUFF")
      return
    }

    if (amount > puffBalance) {
      setError("Insufficient PUFF balance")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/consumer/redeem-puff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puffAmount: amount }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        setRedeemAmount("")
        onRedemptionComplete?.()
        setTimeout(() => setSuccess(false), 5000)
      } else {
        const data = await response.json()
        setError(data.error || "Redemption failed")
      }
    } catch (err) {
      setError("Failed to process redemption")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Coins className="w-5 h-5 text-primary" />
          <span>Redeem PUFF for Cash</span>
        </CardTitle>
        <CardDescription>Convert your PUFF tokens to USDC (100 PUFF = $1 USDC)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-background rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Your PUFF Balance</span>
            <Badge variant="secondary">{puffBalance.toLocaleString()} PUFF</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cash Value</span>
            <span className="font-bold text-primary">${(puffBalance / 100).toFixed(2)} USDC</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="redeem-amount">Amount to Redeem (PUFF)</Label>
          <Input
            id="redeem-amount"
            type="number"
            placeholder="100"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(e.target.value)}
            step="100"
            min="100"
          />
          <p className="text-xs text-muted-foreground">Minimum: 100 PUFF (must be multiple of 100)</p>
        </div>

        {redeemAmount && (
          <div className="p-3 bg-primary/10 rounded-lg flex items-center justify-between">
            <span className="font-medium">{redeemAmount} PUFF</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-primary">${usdcAmount.toFixed(2)} USDC</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <p className="text-sm text-green-700">Redemption successful! USDC sent to your wallet.</p>
          </div>
        )}

        <Button onClick={handleRedeem} disabled={loading || !redeemAmount} className="w-full">
          <Coins className="w-4 h-4 mr-2" />
          {loading ? "Processing..." : "Redeem PUFF"}
        </Button>

        <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
          <p className="font-medium">How it works:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>100 PUFF = $1 USDC (fixed rate)</li>
            <li>Instant redemption to your wallet</li>
            <li>Funded by Puff Vault (merchant fees)</li>
            <li>No redemption fees</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
