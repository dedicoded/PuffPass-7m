"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, Activity } from "lucide-react"

interface SecurityStats {
  totalTransactions: number
  blockedTransactions: number
  flaggedAddresses: number
  averageRiskScore: number
}

export function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats>({
    totalTransactions: 0,
    blockedTransactions: 0,
    flaggedAddresses: 0,
    averageRiskScore: 0,
  })
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])

  useEffect(() => {
    loadSecurityStats()
    const interval = setInterval(loadSecurityStats, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadSecurityStats = async () => {
    try {
      const response = await fetch("/api/security/stats")
      const data = await response.json()
      setStats(data.stats)
      setRecentAlerts(data.alerts || [])
    } catch (error) {
      console.error("Failed to load security stats:", error)
    }
  }

  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score < 30) return { label: "Low", color: "text-green-600" }
    if (score < 60) return { label: "Medium", color: "text-yellow-600" }
    return { label: "High", color: "text-red-600" }
  }

  const riskLevel = getRiskLevel(stats.averageRiskScore)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <p className="text-2xl font-bold">{stats.blockedTransactions}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalTransactions > 0
                ? ((stats.blockedTransactions / stats.totalTransactions) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <p className="text-2xl font-bold">{stats.flaggedAddresses}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${riskLevel.color}`} />
              <p className={`text-2xl font-bold ${riskLevel.color}`}>{riskLevel.label}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Score: {stats.averageRiskScore.toFixed(0)}/100</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Security Alerts
          </CardTitle>
          <CardDescription>Flagged transactions and suspicious activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-900">
                No security alerts in the last 24 hours. All systems operating normally.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{alert.type}</p>
                      <Badge variant="destructive">{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Features Status */}
      <Card>
        <CardHeader>
          <CardTitle>Security Features</CardTitle>
          <CardDescription>Active protection mechanisms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Rate Limiting</p>
                <p className="text-sm text-muted-foreground">Active - 10 tx/min per address</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Fraud Detection</p>
                <p className="text-sm text-muted-foreground">Active - Pattern analysis enabled</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Transaction Replay Protection</p>
                <p className="text-sm text-muted-foreground">Active - Nonce validation</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Address Blocking</p>
                <p className="text-sm text-muted-foreground">Active - {stats.flaggedAddresses} blocked</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
