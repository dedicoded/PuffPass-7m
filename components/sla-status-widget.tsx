// Customer-facing SLA status widget
// Can be embedded in customer dashboards or public status pages

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SLAStatus {
  tier: string
  uptime: number
  errorRate: number
  latency: number
  compliance: boolean
  lastUpdated: string
}

export function SLAStatusWidget({
  customerTier = "bronze",
}: {
  customerTier?: string
}) {
  const [status, setStatus] = useState<SLAStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSLAStatus = async () => {
      try {
        const response = await fetch(`/api/sla/status?tier=${customerTier}`)
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Failed to fetch SLA status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSLAStatus()
    const interval = setInterval(fetchSLAStatus, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [customerTier])

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-sm">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-sm">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Unable to load status</p>
        </CardContent>
      </Card>
    )
  }

  const tierConfig = {
    bronze: { name: "Bronze", color: "bg-amber-600", target: 99.0 },
    silver: { name: "Silver", color: "bg-gray-400", target: 99.5 },
    gold: { name: "Gold", color: "bg-yellow-500", target: 99.9 },
  }

  const config = tierConfig[customerTier as keyof typeof tierConfig] || tierConfig.bronze

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Service Status</CardTitle>
          <Badge
            variant={status.compliance ? "default" : "destructive"}
            className={status.compliance ? config.color : ""}
          >
            {config.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Uptime */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uptime (24h)</span>
            <span className="font-mono">{status.uptime.toFixed(2)}%</span>
          </div>
          <Progress value={status.uptime} className="h-2" />
          <p className="text-xs text-gray-500">Target: {config.target}%</p>
        </div>

        {/* Error Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Error Rate</span>
            <span className="font-mono">{status.errorRate.toFixed(2)}%</span>
          </div>
          <Progress value={Math.max(0, 100 - status.errorRate * 20)} className="h-2" />
        </div>

        {/* Latency */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Avg Latency</span>
            <span className="font-mono">{status.latency}ms</span>
          </div>
        </div>

        {/* Overall Status */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{status.compliance ? "SLA Compliant" : "SLA Breach"}</span>
            <div className={`w-3 h-3 rounded-full ${status.compliance ? "bg-green-500" : "bg-red-500"}`} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {new Date(status.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
