"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Web3HealthIndicator } from "@/components/web3-health-indicator"
import {
  Shield,
  Database,
  Users,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Wallet,
  FileText,
  Settings,
  BarChart3,
  Eye,
  Lock,
  Zap,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data for demonstration
const systemHealthData = [
  { time: "12h ago", value: 99.9 },
  { time: "10h ago", value: 99.8 },
  { time: "8h ago", value: 99.9 },
  { time: "6h ago", value: 100 },
  { time: "4h ago", value: 99.7 },
  { time: "2h ago", value: 99.9 },
  { time: "Now", value: 100 },
]

const userOnboardingData = [
  { time: "12h ago", kyc: 45, crypto: 32, complete: 28 },
  { time: "10h ago", kyc: 52, crypto: 38, complete: 35 },
  { time: "8h ago", kyc: 48, crypto: 41, complete: 39 },
  { time: "6h ago", kyc: 61, crypto: 47, complete: 44 },
  { time: "4h ago", kyc: 58, crypto: 52, complete: 48 },
  { time: "2h ago", kyc: 67, crypto: 59, complete: 55 },
  { time: "Now", kyc: 72, crypto: 64, complete: 61 },
]

const complianceMetrics = [
  { name: "KYC Verified", value: 89, color: "#3b82f6" },
  { name: "Pending Review", value: 8, color: "#f59e0b" },
  { name: "Rejected", value: 3, color: "#ef4444" },
]

export default function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [jwtRotationDays, setJwtRotationDays] = useState(23)
  const [web3Health, setWeb3Health] = useState<any>(null)
  const [isLoadingHealth, setIsLoadingHealth] = useState(false)

  useEffect(() => {
    const fetchWeb3Health = async () => {
      try {
        const response = await fetch("/api/web3/health")
        if (response.ok) {
          const data = await response.json()
          setWeb3Health(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch Web3 health:", error)
      }
    }

    fetchWeb3Health()

    const interval = setInterval(fetchWeb3Health, 30000)
    return () => clearInterval(interval)
  }, [])

  const triggerManualHealthCheck = async () => {
    setIsLoadingHealth(true)
    try {
      const response = await fetch("/api/web3/health", { method: "POST" })
      if (response.ok) {
        const healthResponse = await fetch("/api/web3/health")
        if (healthResponse.ok) {
          const data = await healthResponse.json()
          setWeb3Health(data)
        }
      }
    } catch (error) {
      console.error("[v0] Manual health check failed:", error)
    } finally {
      setIsLoadingHealth(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
              <p className="text-sm text-muted-foreground">Real-time regulatory monitoring for PuffPass</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="status-healthy">
              <CheckCircle className="w-3 h-3 mr-1" />
              All Systems Operational
            </Badge>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
          <nav className="space-y-2">
            <div className="nav-item active">
              <BarChart3 className="w-4 h-4" />
              Overview
            </div>
            <div className="nav-item">
              <Database className="w-4 h-4" />
              System Health
            </div>
            <div className="nav-item">
              <Users className="w-4 h-4" />
              User Flows
            </div>
            <div className="nav-item">
              <Key className="w-4 h-4" />
              JWT Rotation
            </div>
            <div className="nav-item">
              <Wallet className="w-4 h-4" />
              Crypto Integration
            </div>
            <div className="nav-item">
              <Eye className="w-4 h-4" />
              Audit Trails
            </div>
            <div className="nav-item">
              <Lock className="w-4 h-4" />
              Security
            </div>
            <div className="nav-item">
              <Settings className="w-4 h-4" />
              Configuration
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="compliance-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="metric-label">System Uptime</p>
                        <p className="metric-value text-success">99.9%</p>
                      </div>
                      <Activity className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="compliance-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="metric-label">Active Users</p>
                        <p className="metric-value">2,847</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="compliance-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="metric-label">KYC Completion</p>
                        <p className="metric-value text-success">89%</p>
                      </div>
                      <Shield className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="compliance-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="metric-label">JWT Rotation</p>
                        <p className="metric-value text-warning">{jwtRotationDays}d</p>
                      </div>
                      <Key className="w-8 h-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="compliance-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={systemHealthData}>
                          <defs>
                            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[99, 100]} stroke="hsl(var(--muted-foreground))" />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#healthGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="compliance-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Onboarding Flow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userOnboardingData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Line type="monotone" dataKey="kyc" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                          <Line type="monotone" dataKey="crypto" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                          <Line type="monotone" dataKey="complete" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                        <span>KYC Started</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                        <span>Crypto Setup</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                        <span>Complete</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="compliance-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      KYC Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={complianceMetrics}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {complianceMetrics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {complianceMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }}></div>
                            <span>{metric.name}</span>
                          </div>
                          <span className="font-medium">{metric.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="compliance-card">
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
                        <span className="font-medium">{90 - jwtRotationDays} days</span>
                      </div>
                      <Progress value={(jwtRotationDays / 90) * 100} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm">Dual-secret verification active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm">Audit logging enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-sm">Rotation reminder set</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="compliance-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Crypto Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {web3Health?.integrations?.map((integration: any) => (
                        <div key={integration.integration_name} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{integration.integration_name}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                integration.status === "active"
                                  ? "status-healthy"
                                  : integration.status === "degraded"
                                    ? "status-warning"
                                    : "status-error"
                              }
                            >
                              {integration.status}
                            </Badge>
                            {integration.health_score && (
                              <span className="text-xs text-muted-foreground">{integration.health_score}%</span>
                            )}
                          </div>
                        </div>
                      )) || (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Cybrid API</span>
                            <Badge className="status-healthy">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sphere Payments</span>
                            <Badge className="status-healthy">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">WalletConnect</span>
                            <Web3HealthIndicator />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Biconomy</span>
                            <Badge className="status-healthy">Active</Badge>
                          </div>
                        </>
                      )}
                    </div>

                    {web3Health?.summary && (
                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Web3 Uptime (24h)</span>
                          <span className="font-medium">{web3Health.summary.uptimePercentage}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Avg Response Time</span>
                          <span className="font-medium">{web3Health.summary.averageLatency}ms</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Health Checks (24h)</span>
                          <span className="font-medium">{web3Health.summary.totalChecks}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={triggerManualHealthCheck}
                          disabled={isLoadingHealth}
                          className="w-full mt-2 bg-transparent"
                        >
                          {isLoadingHealth ? (
                            <>
                              <Clock className="w-3 h-3 mr-2 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            <>
                              <Activity className="w-3 h-3 mr-2" />
                              Manual Health Check
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span>Total Transactions</span>
                        <span className="font-medium">1,247</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="compliance-card">
                  <CardHeader>
                    <CardTitle>Security Audit Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">JWT rotation completed</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                        <Zap className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Wallet connection verified</p>
                          <p className="text-xs text-muted-foreground">4 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Failed login attempt detected</p>
                          <p className="text-xs text-muted-foreground">6 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="compliance-card">
                  <CardHeader>
                    <CardTitle>Compliance Checkpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">KYC Verification Process</span>
                        <Badge className="status-healthy">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Encryption Standards</span>
                        <Badge className="status-healthy">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Audit Trail Logging</span>
                        <Badge className="status-healthy">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">JWT Rotation Policy</span>
                        <Badge className="status-warning">Due Soon</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cannabis Regulations</span>
                        <Badge className="status-healthy">Compliant</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Compliance Reports</h3>
                <p className="text-muted-foreground mb-6">Generate detailed compliance reports for regulatory audits</p>
                <Button>Generate Full Report</Button>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Integration Status</h3>
                <p className="text-muted-foreground mb-6">Monitor all third-party integrations and API health</p>
                <Button>View Integration Console</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
