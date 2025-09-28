"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Wallet,
  TrendingUp,
  Target,
  Zap,
  Settings,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

interface FloatAllocation {
  type: string
  amount: number
  percentage: number
  target_apy: number
  current_apy: number
  last_rebalanced: string
}

interface FloatManagementData {
  total_float: number
  allocations: {
    stablecoins: number
    fiat_reserves: number
    yield_deployment: number
  }
  yield_metrics: {
    current_apy: number
    projected_monthly_yield: number
    projected_annual_yield: number
    recent_yield_generated: number
  }
  float_utilization: {
    utilization_rate: number
    target_utilization: number
    available_for_deployment: number
  }
  allocation_details: FloatAllocation[]
  last_updated: string
}

export function FloatAllocationDashboard() {
  const [floatData, setFloatData] = useState<FloatManagementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rebalancing, setRebalancing] = useState(false)
  const [newAllocations, setNewAllocations] = useState<FloatAllocation[]>([])
  const [showRebalanceDialog, setShowRebalanceDialog] = useState(false)

  useEffect(() => {
    fetchFloatData()
  }, [])

  const fetchFloatData = async () => {
    try {
      const response = await fetch("/api/admin/vault/float-management")
      if (response.ok) {
        const data = await response.json()
        setFloatData(data)
        setNewAllocations(data.allocation_details)
      }
    } catch (error) {
      console.error("Failed to fetch float data:", error)
      toast.error("Failed to load float management data")
    } finally {
      setLoading(false)
    }
  }

  const handleRebalance = async () => {
    setRebalancing(true)
    try {
      const response = await fetch("/api/admin/vault/float-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations: newAllocations }),
      })

      if (response.ok) {
        toast.success("Float allocations updated successfully")
        fetchFloatData()
        setShowRebalanceDialog(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update allocations")
      }
    } catch (error) {
      console.error("Rebalancing error:", error)
      toast.error("Failed to update allocations")
    } finally {
      setRebalancing(false)
    }
  }

  const updateAllocation = (index: number, field: string, value: number) => {
    const updated = [...newAllocations]
    updated[index] = { ...updated[index], [field]: value }
    setNewAllocations(updated)
  }

  const getUtilizationStatus = (rate: number, target: number) => {
    if (rate >= target * 0.9) return { status: "optimal", color: "text-green-600", bg: "bg-green-100" }
    if (rate >= target * 0.7) return { status: "good", color: "text-blue-600", bg: "bg-blue-100" }
    return { status: "low", color: "text-yellow-600", bg: "bg-yellow-100" }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading float management data...</p>
      </div>
    )
  }

  if (!floatData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load float management data</p>
        <Button onClick={fetchFloatData} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  const utilizationStatus = getUtilizationStatus(
    floatData.float_utilization.utilization_rate,
    floatData.float_utilization.target_utilization,
  )

  return (
    <div className="space-y-6">
      {/* Float Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Float</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${floatData.total_float.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {floatData.float_utilization.utilization_rate.toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${floatData.yield_metrics.projected_monthly_yield.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {(floatData.yield_metrics.current_apy * 100).toFixed(2)}% APY
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available to Deploy</CardTitle>
            <Target className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${floatData.float_utilization.available_for_deployment.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Ready for allocation</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Status</CardTitle>
            {utilizationStatus.status === "optimal" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{utilizationStatus.status}</div>
            <p className="text-xs text-muted-foreground">Target: {floatData.float_utilization.target_utilization}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Current Float Allocation
            </CardTitle>
            <CardDescription>How user funds are currently deployed for yield generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div>
                  <p className="font-medium">Stablecoins (USDC/DAI)</p>
                  <p className="text-sm text-muted-foreground">
                    {((floatData.allocations.stablecoins / floatData.total_float) * 100).toFixed(1)}% allocation
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${floatData.allocations.stablecoins.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {(
                      floatData.allocation_details.find((a) => a.type === "stablecoins")?.current_apy * 100 || 0
                    ).toFixed(1)}
                    % APY
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-chart-2/5 rounded-lg border border-chart-2/20">
                <div>
                  <p className="font-medium">Fiat Reserves</p>
                  <p className="text-sm text-muted-foreground">
                    {((floatData.allocations.fiat_reserves / floatData.total_float) * 100).toFixed(1)}% allocation
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${floatData.allocations.fiat_reserves.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Instant liquidity</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-chart-3/5 rounded-lg border border-chart-3/20">
                <div>
                  <p className="font-medium">Yield Deployment</p>
                  <p className="text-sm text-muted-foreground">
                    {((floatData.allocations.yield_deployment / floatData.total_float) * 100).toFixed(1)}% allocation
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${floatData.allocations.yield_deployment.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {(
                      floatData.allocation_details.find((a) => a.type === "yield_deployment")?.current_apy * 100 || 0
                    ).toFixed(1)}
                    % APY
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Yield Performance
            </CardTitle>
            <CardDescription>Float yield generation and projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Monthly Projection</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  ${floatData.yield_metrics.projected_monthly_yield.toFixed(0)}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-chart-2" />
                  <span className="text-sm font-medium">Annual Projection</span>
                </div>
                <p className="text-2xl font-bold text-chart-2">
                  ${floatData.yield_metrics.projected_annual_yield.toFixed(0)}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-chart-3" />
                  <span className="text-sm font-medium">Recent Yield</span>
                </div>
                <p className="text-2xl font-bold text-chart-3">
                  ${floatData.yield_metrics.recent_yield_generated.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-chart-4" />
                  <span className="text-sm font-medium">Weighted APY</span>
                </div>
                <p className="text-2xl font-bold text-chart-4">
                  {(floatData.yield_metrics.current_apy * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Yield Strategy:</strong> Conservative approach with 70% in stablecoins, 25% fiat reserves for
                liquidity, and 5% in higher-yield strategies. This maintains safety while generating sustainable
                returns.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rebalancing Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Float Allocation Management
              </CardTitle>
              <CardDescription>
                Adjust allocation percentages to optimize yield while maintaining liquidity
              </CardDescription>
            </div>
            <Dialog open={showRebalanceDialog} onOpenChange={setShowRebalanceDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Rebalance Allocations
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Rebalance Float Allocations</DialogTitle>
                  <DialogDescription>
                    Adjust the allocation percentages for optimal yield generation. Changes require trustee approval.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {newAllocations.map((allocation, index) => (
                    <div key={allocation.type} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{allocation.type.replace("_", " ")}</h4>
                        <Badge variant="outline">{allocation.percentage.toFixed(1)}%</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label>Allocation Percentage</Label>
                        <Slider
                          value={[allocation.percentage]}
                          onValueChange={(value) => updateAllocation(index, "percentage", value[0])}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>0%</span>
                          <span>{allocation.percentage.toFixed(1)}%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Amount ($)</Label>
                          <Input
                            type="number"
                            value={allocation.amount}
                            onChange={(e) => updateAllocation(index, "amount", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Current APY (%)</Label>
                          <Input
                            type="number"
                            value={(allocation.current_apy * 100).toFixed(2)}
                            onChange={(e) =>
                              updateAllocation(index, "current_apy", (Number.parseFloat(e.target.value) || 0) / 100)
                            }
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Allocation: {newAllocations.reduce((sum, a) => sum + a.percentage, 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Projected Monthly Yield: $
                        {(newAllocations.reduce((sum, a) => sum + a.amount * a.current_apy, 0) / 12).toFixed(0)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setShowRebalanceDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleRebalance} disabled={rebalancing}>
                        {rebalancing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Rebalancing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Rebalance
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {floatData.allocation_details.map((allocation) => (
              <div key={allocation.type} className="p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">{allocation.type.replace("_", " ")}</h4>
                  <Badge variant="outline">{allocation.percentage.toFixed(1)}%</Badge>
                </div>
                <p className="text-2xl font-bold mb-1">${allocation.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  APY: {allocation.current_apy.toFixed(2)}% | Target: {allocation.target_apy.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Last rebalanced: {new Date(allocation.last_rebalanced).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status & Recommendations</CardTitle>
          <CardDescription>Automated insights and optimization suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${utilizationStatus.bg} ${utilizationStatus.color}`}>
              <div className="flex items-center gap-2 mb-2">
                {utilizationStatus.status === "optimal" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span className="font-medium">Float Utilization: {utilizationStatus.status}</span>
              </div>
              <p className="text-sm">
                Current utilization is {floatData.float_utilization.utilization_rate.toFixed(1)}% (Target:{" "}
                {floatData.float_utilization.target_utilization}%).
                {utilizationStatus.status === "optimal"
                  ? "Excellent balance between yield generation and liquidity."
                  : utilizationStatus.status === "good"
                    ? "Good utilization, consider deploying more funds for higher yield."
                    : "Low utilization detected. Consider rebalancing to increase yield generation."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Yield Optimization</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Current weighted APY is {(floatData.yield_metrics.current_apy * 100).toFixed(2)}%. Consider increasing
                  yield deployment allocation if market conditions are favorable.
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Liquidity Status</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Fiat reserves of ${floatData.allocations.fiat_reserves.toLocaleString()} provide excellent liquidity
                  for immediate withdrawal requests.
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(floatData.last_updated).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
