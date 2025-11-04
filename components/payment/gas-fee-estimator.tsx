"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Fuel, TrendingUp, Zap, Clock } from "lucide-react"

interface GasFeeEstimate {
  slow: { gwei: number; time: string; usd: number }
  medium: { gwei: number; time: string; usd: number }
  fast: { gwei: number; time: string; usd: number }
}

interface GasFeeEstimatorProps {
  onSelectFee?: (tier: "slow" | "medium" | "fast", fee: number) => void
  transactionType?: "transfer" | "swap" | "contract"
}

export function GasFeeEstimator({ onSelectFee, transactionType = "transfer" }: GasFeeEstimatorProps) {
  const [estimates, setEstimates] = useState<GasFeeEstimate | null>(null)
  const [selectedTier, setSelectedTier] = useState<"slow" | "medium" | "fast">("medium")
  const [loading, setLoading] = useState(true)
  const [ethPrice, setEthPrice] = useState(2000) // Default ETH price

  useEffect(() => {
    fetchGasEstimates()
    const interval = setInterval(fetchGasEstimates, 15000) // Update every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchGasEstimates = async () => {
    try {
      // In production, fetch from gas oracle API (e.g., Etherscan, EtherGasStation)
      // For now, using mock data
      const mockEstimates: GasFeeEstimate = {
        slow: { gwei: 15, time: "~5 min", usd: 0.63 },
        medium: { gwei: 25, time: "~2 min", usd: 1.05 },
        fast: { gwei: 35, time: "~30 sec", usd: 1.47 },
      }

      setEstimates(mockEstimates)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch gas estimates:", error)
      setLoading(false)
    }
  }

  const handleSelectTier = (tier: "slow" | "medium" | "fast") => {
    setSelectedTier(tier)
    if (estimates && onSelectFee) {
      onSelectFee(tier, estimates[tier].gwei)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "slow":
        return <Clock className="w-4 h-4" />
      case "medium":
        return <TrendingUp className="w-4 h-4" />
      case "fast":
        return <Zap className="w-4 h-4" />
      default:
        return <Fuel className="w-4 h-4" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "slow":
        return "text-blue-600 bg-blue-100 border-blue-200"
      case "medium":
        return "text-orange-600 bg-orange-100 border-orange-200"
      case "fast":
        return "text-red-600 bg-red-100 border-red-200"
      default:
        return "text-gray-600 bg-gray-100 border-gray-200"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Fetching gas prices...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!estimates) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">Unable to fetch gas estimates</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="w-5 h-5" />
          Gas Fee Estimation
        </CardTitle>
        <CardDescription>Choose your transaction speed and cost</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedTier} onValueChange={(value) => handleSelectTier(value as any)}>
          <div className="space-y-3">
            {(["slow", "medium", "fast"] as const).map((tier) => (
              <div
                key={tier}
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTier === tier ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                }`}
                onClick={() => handleSelectTier(tier)}
              >
                <RadioGroupItem value={tier} id={tier} />
                <Label htmlFor={tier} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getTierColor(tier)}>
                        {getTierIcon(tier)}
                        <span className="ml-1 capitalize">{tier}</span>
                      </Badge>
                      <div>
                        <p className="font-medium">{estimates[tier].gwei} Gwei</p>
                        <p className="text-xs text-muted-foreground">{estimates[tier].time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${estimates[tier].usd.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Est. cost</p>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="p-3 bg-muted rounded-lg text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Transaction Type:</span>
            <Badge variant="outline" className="capitalize">
              {transactionType}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ETH Price:</span>
            <span className="font-medium">${ethPrice.toLocaleString()}</span>
          </div>
          <p className="text-muted-foreground pt-2">Gas prices update every 15 seconds based on network conditions.</p>
        </div>
      </CardContent>
    </Card>
  )
}
