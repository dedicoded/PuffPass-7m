"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FiatConversionDisplayProps {
  cryptoAmount: number
  cryptoCurrency: string
  fiatCurrency?: string
  showTrend?: boolean
  compact?: boolean
}

interface PriceData {
  price: number
  change24h: number
  lastUpdated: string
}

export function FiatConversionDisplay({
  cryptoAmount,
  cryptoCurrency,
  fiatCurrency = "USD",
  showTrend = true,
  compact = false,
}: FiatConversionDisplayProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrice()
    const interval = setInterval(fetchPrice, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [cryptoCurrency])

  const fetchPrice = async () => {
    try {
      // In production, fetch from price API (e.g., CoinGecko, CoinMarketCap)
      // For now, using mock data
      const mockPrices: Record<string, PriceData> = {
        BTC: { price: 45000, change24h: 2.5, lastUpdated: new Date().toISOString() },
        ETH: { price: 2500, change24h: -1.2, lastUpdated: new Date().toISOString() },
        USDC: { price: 1.0, change24h: 0.01, lastUpdated: new Date().toISOString() },
        USDT: { price: 1.0, change24h: -0.01, lastUpdated: new Date().toISOString() },
        PUFF: { price: 0.01, change24h: 0, lastUpdated: new Date().toISOString() },
      }

      setPriceData(mockPrices[cryptoCurrency] || mockPrices.USDC)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch price:", error)
      setLoading(false)
    }
  }

  if (loading || !priceData) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Loading price...</span>
      </div>
    )
  }

  const fiatValue = cryptoAmount * priceData.price
  const isPositiveChange = priceData.change24h >= 0

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary">
          ${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {showTrend && (
          <Badge variant={isPositiveChange ? "default" : "destructive"} className="text-xs">
            {isPositiveChange ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(priceData.change24h).toFixed(2)}%
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Fiat Value</span>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchPrice} className="h-6 w-6 p-0">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                ${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm text-muted-foreground">{fiatCurrency}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {cryptoAmount} {cryptoCurrency}
              </span>
              <span className="text-muted-foreground">@</span>
              <span className="font-medium">
                ${priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </span>
            </div>
          </div>

          {showTrend && (
            <div className="flex items-center justify-between pt-2 border-t border-primary/10">
              <span className="text-xs text-muted-foreground">24h Change</span>
              <Badge variant={isPositiveChange ? "default" : "destructive"} className="text-xs">
                {isPositiveChange ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {isPositiveChange ? "+" : ""}
                {priceData.change24h.toFixed(2)}%
              </Badge>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(priceData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
