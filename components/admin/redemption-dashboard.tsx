"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, DollarSign, Pause, Play, AlertCircle } from "lucide-react"

interface RedemptionStats {
  contract_stats: {
    contract_address: string
    vault_balance_usdc: number
    total_redeemed_puff: number
    total_usdc_paid: number
    redemption_rate: number
    is_paused: boolean
  }
  recent_redemptions: Array<{
    id: string
    user_id: string
    puff_amount: number
    usdc_amount: number
    transaction_hash: string
    status: string
    created_at: string
  }>
  monthly_trends: Array<{
    month: string
    total_puff: number
    total_usdc: number
    redemption_count: number
  }>
}

export function RedemptionDashboard() {
  const [stats, setStats] = useState<RedemptionStats | null>(null)
  const [fundAmount, setFundAmount] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRedemptionStats()
  }, [])

  const fetchRedemptionStats = async () => {
    try {
      const response = await fetch("/api/puff-vault/redemption")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch redemption stats:", error)
    }
  }

  const handleFundVault = async () => {
    if (!fundAmount || Number.parseFloat(fundAmount) <= 0) return

    setLoading(true)
    try {
      const response = await fetch("/api/puff-vault/redemption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fund_vault",
          amount: Number.parseFloat(fundAmount),
        }),
      })

      if (response.ok) {
        alert("Vault funded successfully!")
        setFundAmount("")
        fetchRedemptionStats()
      }
    } catch (error) {
      console.error("Failed to fund vault:", error)
      alert("Failed to fund vault")
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePause = async () => {
    setLoading(true)
    try {
      const action = stats?.contract_stats.is_paused ? "unpause_redemptions" : "pause_redemptions"
      const response = await fetch("/api/puff-vault/redemption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        alert(`Redemptions ${stats?.contract_stats.is_paused ? "resumed" : "paused"}!`)
        fetchRedemptionStats()
      }
    } catch (error) {
      console.error("Failed to toggle pause:", error)
      alert("Failed to update redemption status")
    } finally {
      setLoading(false)
    }
  }

  if (!stats) {
    return <div className="text-center py-8">Loading redemption data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vault Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.contract_stats.vault_balance_usdc.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">USDC available for redemptions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contract_stats.total_redeemed_puff.toLocaleString()} PUFF</div>
            <p className="text-xs text-muted-foreground">
              ${stats.contract_stats.total_usdc_paid.toLocaleString()} USDC paid
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contract_stats.redemption_rate} PUFF</div>
            <p className="text-xs text-muted-foreground">= $1 USDC</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {stats.contract_stats.is_paused ? (
              <Pause className="h-4 w-4 text-destructive" />
            ) : (
              <Play className="h-4 w-4 text-chart-4" />
            )}
          </CardHeader>
          <CardContent>
            <Badge variant={stats.contract_stats.is_paused ? "destructive" : "default"}>
              {stats.contract_stats.is_paused ? "Paused" : "Active"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Redemption system</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fund Redemption Vault</CardTitle>
            <CardDescription>Add USDC from withdrawal fees to enable redemptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fund-amount">USDC Amount</Label>
              <Input
                id="fund-amount"
                type="number"
                placeholder="1000"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleFundVault} disabled={loading || !fundAmount} className="w-full">
              <Wallet className="w-4 h-4 mr-2" />
              Fund Vault
            </Button>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Funding Sources:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>7% merchant withdrawal fees</li>
                <li>Portion of 2.5% transaction fees</li>
                <li>Platform reserves</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Controls</CardTitle>
            <CardDescription>Pause/resume redemptions if needed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Emergency Pause</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use only during security incidents or contract migrations
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant={stats.contract_stats.is_paused ? "default" : "destructive"}
              onClick={handleTogglePause}
              disabled={loading}
              className="w-full"
            >
              {stats.contract_stats.is_paused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume Redemptions
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Redemptions
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Contract: {stats.contract_stats.contract_address.substring(0, 10)}...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Redemptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Redemptions</CardTitle>
          <CardDescription>Latest PUFF → USDC conversions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recent_redemptions.slice(0, 10).map((redemption) => (
              <div key={redemption.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{redemption.puff_amount.toLocaleString()} PUFF</p>
                  <p className="text-sm text-muted-foreground">User: {redemption.user_id.substring(0, 8)}...</p>
                  <p className="text-xs text-muted-foreground">{new Date(redemption.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">${redemption.usdc_amount.toFixed(2)}</p>
                  <Badge variant="default" className="text-xs">
                    {redemption.status}
                  </Badge>
                </div>
              </div>
            ))}
            {stats.recent_redemptions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No redemptions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
