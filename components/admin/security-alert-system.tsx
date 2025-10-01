"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, AlertTriangle, Shield, Clock, CheckCircle, Eye, Settings, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface SecurityAlert {
  id: string
  type: "authentication" | "authorization" | "system" | "compliance" | "threat"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  timestamp: string
  source: string
  status: "active" | "acknowledged" | "resolved"
  metadata?: Record<string, any>
}

interface AlertSystemProps {
  className?: string
}

// Mock real-time alerts - in production this would come from WebSocket or SSE
const mockAlerts: SecurityAlert[] = [
  {
    id: "alert-001",
    type: "threat",
    severity: "high",
    title: "Multiple Failed Login Attempts",
    message: "Detected 15 failed login attempts from IP 192.168.1.100 in the last 5 minutes",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    source: "Authentication Service",
    status: "active",
    metadata: { ip: "192.168.1.100", attempts: 15, user: "merchant@example.com" },
  },
  {
    id: "alert-002",
    type: "system",
    severity: "critical",
    title: "JWT Rotation Overdue",
    message: "JWT secret rotation is 7 days overdue. Immediate action required for compliance.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    source: "Security Monitor",
    status: "active",
    metadata: { daysOverdue: 7, lastRotation: "2024-01-08T10:30:00Z" },
  },
  {
    id: "alert-003",
    type: "compliance",
    severity: "medium",
    title: "Rate Limiting Threshold Exceeded",
    message: "API rate limit exceeded on /api/auth/login endpoint. Consider implementing stricter limits.",
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    source: "API Gateway",
    status: "acknowledged",
    metadata: { endpoint: "/api/auth/login", requests: 1500, limit: 1000 },
  },
  {
    id: "alert-004",
    type: "authentication",
    severity: "low",
    title: "Unusual Login Pattern",
    message: "User logged in from new device/location. Verification email sent.",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    source: "Device Fingerprinting",
    status: "resolved",
    metadata: { user: "admin@puffpass.com", location: "San Francisco, CA", device: "Chrome/Mac" },
  },
  {
    id: "alert-005",
    type: "authorization",
    severity: "high",
    title: "Privilege Escalation Attempt",
    message: "Customer account attempted to access admin endpoints. Account temporarily suspended.",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    source: "Authorization Service",
    status: "resolved",
    metadata: { user: "customer@example.com", endpoint: "/api/admin/users", action: "suspended" },
  },
]

export function SecurityAlertSystem({ className }: AlertSystemProps) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(mockAlerts)
  const [filter, setFilter] = useState<"all" | "active" | "acknowledged" | "resolved">("all")
  const [severityFilter, setSeverityFilter] = useState<"all" | "low" | "medium" | "high" | "critical">("all")
  const [isConnected, setIsConnected] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new alert occasionally
      if (Math.random() < 0.1) {
        const newAlert: SecurityAlert = {
          id: `alert-${Date.now()}`,
          type: ["authentication", "system", "threat", "compliance"][Math.floor(Math.random() * 4)] as any,
          severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
          title: "New Security Event Detected",
          message: "Real-time security monitoring detected a new event requiring attention.",
          timestamp: new Date().toISOString(),
          source: "Security Monitor",
          status: "active",
        }
        setAlerts((prev) => [newAlert, ...prev].slice(0, 20)) // Keep only latest 20
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "threat":
        return <AlertTriangle className="w-4 h-4" />
      case "system":
        return <Settings className="w-4 h-4" />
      case "authentication":
        return <Shield className="w-4 h-4" />
      case "authorization":
        return <Eye className="w-4 h-4" />
      case "compliance":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-500"
      case "acknowledged":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleAlertAction = (alertId: string, action: "acknowledge" | "resolve" | "dismiss") => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: action === "acknowledge" ? "acknowledged" : action === "resolve" ? "resolved" : alert.status,
            }
          : alert,
      ),
    )
  }

  const filteredAlerts = alerts.filter((alert) => {
    const statusMatch = filter === "all" || alert.status === filter
    const severityMatch = severityFilter === "all" || alert.severity === severityFilter
    return statusMatch && severityMatch
  })

  const activeAlertsCount = alerts.filter((a) => a.status === "active").length
  const criticalAlertsCount = alerts.filter((a) => a.severity === "critical" && a.status === "active").length

  return (
    <div className={cn("space-y-6", className)}>
      {/* Alert System Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-foreground" />
            {activeAlertsCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Security Alert System</h3>
            <p className="text-sm text-muted-foreground">Real-time threat monitoring and incident response</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="security-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{activeAlertsCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-800">{criticalAlertsCount}</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter((a) => a.status === "acknowledged").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved (24h)</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter((a) => a.status === "resolved").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="security-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Alert Filters</CardTitle>
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {["all", "active", "acknowledged", "resolved"].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status as any)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm font-medium">Severity:</span>
              {["all", "low", "medium", "high", "critical"].map((severity) => (
                <Button
                  key={severity}
                  variant={severityFilter === severity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSeverityFilter(severity as any)}
                  className="capitalize"
                >
                  {severity}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <Card className="security-card">
        <CardHeader>
          <CardTitle>Recent Security Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No alerts match the current filters</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className={`border-l-4 ${
                    alert.severity === "critical"
                      ? "border-l-red-500"
                      : alert.severity === "high"
                        ? "border-l-orange-500"
                        : alert.severity === "medium"
                          ? "border-l-yellow-500"
                          : "border-l-blue-500"
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getTypeIcon(alert.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(alert.status)}`} />
                            <span className="text-xs text-muted-foreground capitalize">{alert.status}</span>
                          </div>
                        </div>
                        <AlertDescription className="text-sm mb-2">{alert.message}</AlertDescription>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{alert.source}</span>
                          <span>•</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          {alert.metadata && (
                            <>
                              <span>•</span>
                              <span>
                                {Object.entries(alert.metadata)
                                  .slice(0, 2)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(", ")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {alert.status === "active" && (
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, "acknowledge")}
                          className="text-xs"
                        >
                          Acknowledge
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, "resolve")}
                          className="text-xs"
                        >
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alert Banner */}
      {criticalAlertsCount > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-400">
            <strong>Critical Security Alert:</strong> {criticalAlertsCount} critical security{" "}
            {criticalAlertsCount === 1 ? "issue" : "issues"} require immediate attention.
            <Button variant="link" className="p-0 h-auto text-red-600 underline ml-2">
              View Details
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
