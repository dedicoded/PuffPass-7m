"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key,
  Users,
  Database,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { SecurityAlertSystem } from "./security-alert-system"
import { SecurityAuditLog } from "./security-audit-log"
import { ComplianceReporting } from "./compliance-reporting"

// Mock security data - in production this would come from APIs
const securityMetrics = {
  authenticationOverview: {
    totalSessions: 2847,
    activeSessions: 1923,
    failedLogins: 12,
    passkeysActive: 1456,
    walletConnections: 234,
  },
  sessionManagement: {
    adminSessions: { active: 3, duration: "1-2 hrs", rotation: "90-day JWT" },
    merchantSessions: { active: 156, duration: "3 days", rotation: "90-day JWT" },
    customerSessions: { active: 1764, duration: "7 days", rotation: "90-day JWT" },
  },
  jwtRotation: {
    daysUntilRotation: 23,
    lastRotation: "2024-01-02T10:30:00Z",
    rotationStatus: "healthy",
    auditLogged: true,
  },
  complianceStatus: {
    kycCompletion: 89,
    passwordComplexity: 76,
    rateLimiting: 45,
    inputValidation: 82,
  },
  threatMonitoring: {
    blockedAttempts: 47,
    suspiciousActivity: 3,
    cspViolations: 8,
    securityAlerts: 2,
  },
}

const securityTrendData = [
  { time: "00:00", threats: 2, sessions: 1200, auth: 98.9 },
  { time: "04:00", threats: 1, sessions: 890, auth: 99.2 },
  { time: "08:00", threats: 5, sessions: 1450, auth: 98.7 },
  { time: "12:00", threats: 3, sessions: 1890, auth: 99.1 },
  { time: "16:00", threats: 7, sessions: 2100, auth: 98.5 },
  { time: "20:00", threats: 4, sessions: 1750, auth: 99.0 },
  { time: "24:00", threats: 2, sessions: 1400, auth: 99.3 },
]

const authMethodData = [
  { method: "Password", count: 1234, color: "#3b82f6" },
  { method: "Passkey", count: 1456, color: "#10b981" },
  { method: "Wallet", count: 234, color: "#f59e0b" },
  { method: "Admin", count: 23, color: "#ef4444" },
]

const recentSecurityEvents = [
  {
    id: "1",
    type: "jwt_rotation",
    severity: "info",
    message: "JWT secret rotation completed successfully",
    timestamp: "2024-01-15T10:30:00Z",
    details: "Dual-secret verification active, audit logged",
  },
  {
    id: "2",
    type: "failed_login",
    severity: "warning",
    message: "Multiple failed login attempts detected",
    timestamp: "2024-01-15T09:45:00Z",
    details: "IP: 192.168.1.100, User: merchant@example.com",
  },
  {
    id: "3",
    type: "wallet_verification",
    severity: "info",
    message: "Admin wallet connection verified",
    timestamp: "2024-01-15T08:20:00Z",
    details: "Trustee wallet 0x1234...5678 authenticated",
  },
  {
    id: "4",
    type: "csp_violation",
    severity: "low",
    message: "Content Security Policy violation reported",
    timestamp: "2024-01-15T07:15:00Z",
    details: "Blocked inline script execution",
  },
  {
    id: "5",
    type: "rate_limit",
    severity: "warning",
    message: "Rate limit exceeded on authentication endpoint",
    timestamp: "2024-01-15T06:30:00Z",
    details: "IP: 10.0.0.50 temporarily blocked",
  },
]

export function SecurityDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h")

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500 bg-red-50 border-red-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "low":
        return "text-gray-600 bg-gray-50 border-gray-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case "jwt_rotation":
        return <Key className="w-4 h-4" />
      case "failed_login":
        return <AlertTriangle className="w-4 h-4" />
      case "wallet_verification":
        return <CheckCircle className="w-4 h-4" />
      case "csp_violation":
        return <Shield className="w-4 h-4" />
      case "rate_limit":
        return <Clock className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Security Dashboard</h2>
          <p className="text-muted-foreground">Real-time security monitoring for PuffPass platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Secure
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Real-time Alerts</TabsTrigger>
          <TabsTrigger value="monitoring">Threat Monitoring</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reporting">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="security-card border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                    <p className="text-2xl font-bold text-foreground">
                      {securityMetrics.authenticationOverview.activeSessions.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {securityMetrics.authenticationOverview.totalSessions.toLocaleString()} total
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Passkey Adoption</p>
                    <p className="text-2xl font-bold text-foreground">
                      {securityMetrics.authenticationOverview.passkeysActive.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(
                        (securityMetrics.authenticationOverview.passkeysActive /
                          securityMetrics.authenticationOverview.totalSessions) *
                          100,
                      )}
                      % of users
                    </p>
                  </div>
                  <Key className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">JWT Rotation</p>
                    <p className="text-2xl font-bold text-foreground">
                      {90 - securityMetrics.jwtRotation.daysUntilRotation}d
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {securityMetrics.jwtRotation.daysUntilRotation} days remaining
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Threat Blocks</p>
                    <p className="text-2xl font-bold text-foreground">
                      {securityMetrics.threatMonitoring.blockedAttempts}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {securityMetrics.threatMonitoring.suspiciousActivity} suspicious
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Trends Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="security-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Security Metrics (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={securityTrendData}>
                      <defs>
                        <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="authGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Area
                        type="monotone"
                        dataKey="threats"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#threatGradient)"
                        name="Threats Blocked"
                      />
                      <Area
                        type="monotone"
                        dataKey="auth"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#authGradient)"
                        name="Auth Success %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Authentication Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={authMethodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="method" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Management & JWT Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="security-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Session Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-blue-900">Admin Sessions</p>
                    <p className="text-sm text-blue-700">
                      {securityMetrics.sessionManagement.adminSessions.duration} duration
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900">
                      {securityMetrics.sessionManagement.adminSessions.active}
                    </p>
                    <p className="text-xs text-blue-600">Active</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-green-900">Merchant Sessions</p>
                    <p className="text-sm text-green-700">
                      {securityMetrics.sessionManagement.merchantSessions.duration} duration
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900">
                      {securityMetrics.sessionManagement.merchantSessions.active}
                    </p>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="font-medium text-purple-900">Customer Sessions</p>
                    <p className="text-sm text-purple-700">
                      {securityMetrics.sessionManagement.customerSessions.duration} duration
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-900">
                      {securityMetrics.sessionManagement.customerSessions.active}
                    </p>
                    <p className="text-xs text-purple-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  JWT Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Days until rotation</span>
                    <span className="font-medium">{securityMetrics.jwtRotation.daysUntilRotation} days</span>
                  </div>
                  <Progress value={(securityMetrics.jwtRotation.daysUntilRotation / 90) * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Dual-secret verification active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Audit logging enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Rotation reminder set</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Compliance ready</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Last rotation: {new Date(securityMetrics.jwtRotation.lastRotation).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <SecurityAlertSystem />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Threat Monitoring Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="security-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Threat Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blocked Attempts</span>
                  <span className="font-bold text-red-600">{securityMetrics.threatMonitoring.blockedAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Suspicious Activity</span>
                  <span className="font-bold text-yellow-600">
                    {securityMetrics.threatMonitoring.suspiciousActivity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CSP Violations</span>
                  <span className="font-bold text-blue-600">{securityMetrics.threatMonitoring.cspViolations}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSecurityEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(event.severity)}`}
                    >
                      <div className="mt-0.5">{getSeverityIcon(event.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{event.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <SecurityAuditLog />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Status */}
          <Card className="security-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">KYC Verification</span>
                    <span className="text-sm font-bold text-green-600">
                      {securityMetrics.complianceStatus.kycCompletion}%
                    </span>
                  </div>
                  <Progress value={securityMetrics.complianceStatus.kycCompletion} className="h-2" />
                  <Badge className="bg-green-50 text-green-700 border-green-200">Compliant</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Password Complexity</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {securityMetrics.complianceStatus.passwordComplexity}%
                    </span>
                  </div>
                  <Progress value={securityMetrics.complianceStatus.passwordComplexity} className="h-2" />
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Needs Improvement</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Rate Limiting</span>
                    <span className="text-sm font-bold text-red-600">
                      {securityMetrics.complianceStatus.rateLimiting}%
                    </span>
                  </div>
                  <Progress value={securityMetrics.complianceStatus.rateLimiting} className="h-2" />
                  <Badge className="bg-red-50 text-red-700 border-red-200">Action Required</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Input Validation</span>
                    <span className="text-sm font-bold text-green-600">
                      {securityMetrics.complianceStatus.inputValidation}%
                    </span>
                  </div>
                  <Progress value={securityMetrics.complianceStatus.inputValidation} className="h-2" />
                  <Badge className="bg-green-50 text-green-700 border-green-200">Good</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-6">
          <ComplianceReporting />
        </TabsContent>
      </Tabs>
    </div>
  )
}
