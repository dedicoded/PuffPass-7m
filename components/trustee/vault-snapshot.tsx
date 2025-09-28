"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Coins, TrendingUp, Shield } from "lucide-react"

interface VaultData {
  total_float: string
  allocations: {
    stablecoins: { amount: number; percentage: number; apy: number }
    fiat: { amount: number; percentage: number; apy: number }
    yield_strategies: { amount: number; percentage: number; apy: number }
  }
  rewards_pool_balance: string
  merchant_contributions: string
  reserve_ratio: string
  last_updated: string
}

export function VaultSnapshot() {
  const [vaultData, setVaultData] = useState<VaultData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVaultData() {
      try {
        const response = await fetch("/api/trustee/vault-snapshot")
        if (response.ok) {
          const data = await response.json()
          setVaultData(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch vault data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVaultData()
    const interval = setInterval(fetchVaultData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="treasury-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Vault Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!vaultData) {
    return (
      <Card className="treasury-card">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Failed to load vault data</p>
        </CardContent>
      </Card>
    )
  }

  const totalFloat = Number.parseFloat(vaultData.total_float) || 0
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  return (
    <Card className="treasury-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Vault Snapshot
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Updated {new Date(vaultData.last_updated).toLocaleTimeString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Float */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Float</p>
          <p className="text-4xl font-bold text-foreground">{formatCurrency(totalFloat)}</p>
        </div>

        {/* Allocations */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Stablecoins</span>
              </div>
              <Badge variant="secondary">{vaultData.allocations.stablecoins.apy}% APY</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatCurrency(vaultData.allocations.stablecoins.amount)}</span>
                <span className="text-muted-foreground">{vaultData.allocations.stablecoins.percentage}%</span>
              </div>
              <Progress value={vaultData.allocations.stablecoins.percentage} className="h-2" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Fiat Reserve</span>
              </div>
              <Badge variant="outline">{vaultData.allocations.fiat.apy}% APY</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatCurrency(vaultData.allocations.fiat.amount)}</span>
                <span className="text-muted-foreground">{vaultData.allocations.fiat.percentage}%</span>
              </div>
              <Progress value={vaultData.allocations.fiat.percentage} className="h-2" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Yield Strategies</span>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {vaultData.allocations.yield_strategies.apy}% APY
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatCurrency(vaultData.allocations.yield_strategies.amount)}</span>
                <span className="text-muted-foreground">{vaultData.allocations.yield_strategies.percentage}%</span>
              </div>
              <Progress value={vaultData.allocations.yield_strategies.percentage} className="h-2" />
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Rewards Pool</p>
            <p className="text-lg font-semibold">{formatCurrency(Number.parseFloat(vaultData.rewards_pool_balance))}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Merchant Contributions</p>
            <p className="text-lg font-semibold">
              {formatCurrency(Number.parseFloat(vaultData.merchant_contributions))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Reserve Ratio</p>
            <p className="text-lg font-semibold">{Number.parseFloat(vaultData.reserve_ratio).toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
