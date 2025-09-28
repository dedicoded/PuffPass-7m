"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Calculator, AlertCircle } from "lucide-react"

interface YieldForecastData {
  projected_monthly_yield: number
  rewards_pool_coverage_months: number
  current_apy: number
  allocations: Array<{
    type: string
    amount: number
    percentage: number
    current_apy: number
    target_apy: number
    avg_achieved_apy: number
  }>
  scenario_testing: {
    six_percent_growth: {
      new_float: number
      new_monthly_yield: number
    }
  }
}

export function YieldForecast() {
  const [forecastData, setForecastData] = useState<YieldForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScenario, setShowScenario] = useState(false)

  useEffect(() => {
    async function fetchForecastData() {
      try {
        const response = await fetch("/api/trustee/yield-forecast")
        if (response.ok) {
          const data = await response.json()
          setForecastData(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch forecast data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchForecastData()
    const interval = setInterval(fetchForecastData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="treasury-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Yield Forecasting Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!forecastData) {
    return (
      <Card className="treasury-card">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Failed to load forecast data</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  return (
    <Card className="treasury-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Yield Forecasting Engine
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScenario(!showScenario)}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Scenario Testing
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Projected Monthly Yield</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(forecastData.projected_monthly_yield)}</p>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Current APY</p>
            <p className="text-2xl font-bold text-blue-600">{forecastData.current_apy}%</p>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Pool Coverage</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-bold text-foreground">{forecastData.rewards_pool_coverage_months}</p>
              <span className="text-sm text-muted-foreground">months</span>
              {forecastData.rewards_pool_coverage_months < 3 && <AlertCircle className="h-4 w-4 text-orange-500" />}
            </div>
          </div>
        </div>

        {/* Allocation Performance */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Allocation Performance</h4>
          <div className="space-y-3">
            {forecastData.allocations.map((allocation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium capitalize">{allocation.type.replace("_", " ")}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(allocation.amount)} ({allocation.percentage}%)
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Current: {allocation.current_apy}%
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Target: {allocation.target_apy}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Avg: {allocation.avg_achieved_apy}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Testing */}
        {showScenario && (
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Growth Scenario: 6% Float Increase</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">New Float Size</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(forecastData.scenario_testing.six_percent_growth.new_float)}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">New Monthly Yield</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(forecastData.scenario_testing.six_percent_growth.new_monthly_yield)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
