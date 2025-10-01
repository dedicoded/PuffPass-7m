"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Activity, Download } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AgeVerificationMetrics {
  summary: {
    total_events: number
    last_24h: {
      total: number
      passes: number
      failures: number
    }
  }
  passFailRate: Array<{
    action: string
    count: number
    percentage: number
  }>
  topRoutes: Array<{
    route: string
    access_count: number
    passes: number
    failures: number
    pass_rate: number
  }>
  suspiciousIps: Array<{
    ip_address: string
    total_attempts: number
    failures: number
    passes: number
    last_attempt: string
    attempted_routes: string[]
  }>
  dailyTrends: Array<{
    date: string
    total_events: number
    passes: number
    failures: number
    skips: number
    challenges: number
    pass_rate: number
  }>
  hourlyPattern: Array<{
    hour: number
    total_events: number
    failures: number
    failure_rate: number
  }>
  userAgents: Array<{
    user_agent: string
    total_attempts: number
    failures: number
    unique_ips: number
    last_seen: string
  }>
  recentLogs: Array<{
    id: string
    user_id: string | null
    ip_address: string | null
    route: string
    action: string
    reason: string | null
    verified: boolean | null
    created_at: string
  }>
}

export function AgeVerificationDashboard() {
  const [metrics, setMetrics] = useState<AgeVerificationMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/admin/age-verification-metrics")
      if (!response.ok) throw new Error("Failed to fetch metrics")
      const data = await response.json()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!metrics) return

    const csv = [
      ["Date", "Total Events", "Passes", "Failures", "Pass Rate"],
      ...metrics.dailyTrends.map((day) => [day.date, day.total_events, day.passes, day.failures, `${day.pass_rate}%`]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `age-verification-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <p>Error loading metrics: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) return null

  const passRate =
    metrics.summary.last_24h.total > 0
      ? ((metrics.summary.last_24h.passes / metrics.summary.last_24h.total) * 100).toFixed(1)
      : "0"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Age Verification Compliance</h2>
          <p className="text-muted-foreground">Real-time monitoring of age verification enforcement</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.summary.total_events.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time verification events</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24h Activity</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{metrics.summary.last_24h.total}</div>
            <p className="text-xs text-green-600">{passRate}% pass rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passes (24h)</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{metrics.summary.last_24h.passes}</div>
            <p className="text-xs text-blue-600">Successful verifications</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failures (24h)</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{metrics.summary.last_24h.failures}</div>
            <p className="text-xs text-red-600">Blocked attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Verification Trends</CardTitle>
            <CardDescription>Last 30 days of age verification activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                passes: { label: "Passes", color: "hsl(var(--chart-1))" },
                failures: { label: "Failures", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.dailyTrends.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="passes" stroke="var(--color-passes)" strokeWidth={2} />
                  <Line type="monotone" dataKey="failures" stroke="var(--color-failures)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hourly Activity Pattern</CardTitle>
            <CardDescription>Last 7 days - detect bot patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                total_events: { label: "Events", color: "hsl(var(--chart-3))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.hourlyPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total_events" fill="var(--color-total_events)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Routes Requiring Verification</CardTitle>
          <CardDescription>Most accessed routes with age verification</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead className="text-right">Total Access</TableHead>
                <TableHead className="text-right">Passes</TableHead>
                <TableHead className="text-right">Failures</TableHead>
                <TableHead className="text-right">Pass Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.topRoutes.slice(0, 10).map((route) => (
                <TableRow key={route.route}>
                  <TableCell className="font-mono text-sm">{route.route}</TableCell>
                  <TableCell className="text-right">{route.access_count}</TableCell>
                  <TableCell className="text-right text-green-600">{route.passes}</TableCell>
                  <TableCell className="text-right text-red-600">{route.failures}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={route.pass_rate >= 90 ? "default" : route.pass_rate >= 70 ? "secondary" : "destructive"}
                    >
                      {route.pass_rate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Suspicious IPs */}
      {metrics.suspiciousIps.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span>Suspicious IP Addresses</span>
            </CardTitle>
            <CardDescription>IPs with 3+ failed verification attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Total Attempts</TableHead>
                  <TableHead className="text-right">Failures</TableHead>
                  <TableHead className="text-right">Passes</TableHead>
                  <TableHead>Last Attempt</TableHead>
                  <TableHead>Routes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.suspiciousIps.slice(0, 10).map((ip) => (
                  <TableRow key={ip.ip_address}>
                    <TableCell className="font-mono">{ip.ip_address}</TableCell>
                    <TableCell className="text-right">{ip.total_attempts}</TableCell>
                    <TableCell className="text-right text-red-600 font-bold">{ip.failures}</TableCell>
                    <TableCell className="text-right text-green-600">{ip.passes}</TableCell>
                    <TableCell>{new Date(ip.last_attempt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ip.attempted_routes.length} routes</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Verification Events</CardTitle>
          <CardDescription>Last 100 age verification decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {metrics.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div className="flex items-center space-x-3">
                  {log.action === "pass" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : log.action === "fail" ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Shield className="w-4 h-4 text-blue-600" />
                  )}
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{log.route}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.ip_address} • {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={log.action === "pass" ? "default" : log.action === "fail" ? "destructive" : "secondary"}
                  >
                    {log.action}
                  </Badge>
                  {log.reason && (
                    <Badge variant="outline" className="text-xs">
                      {log.reason}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
