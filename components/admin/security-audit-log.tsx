"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Shield,
  Key,
  Database,
  AlertTriangle,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userEmail: string
  userRole: "admin" | "merchant" | "customer"
  action: string
  resource: string
  resourceId?: string
  outcome: "success" | "failure" | "warning"
  ipAddress: string
  userAgent: string
  details: Record<string, any>
  riskLevel: "low" | "medium" | "high" | "critical"
  sessionId: string
  location?: string
}

interface AuditLogViewerProps {
  className?: string
}

// Mock audit log data - in production this would come from APIs
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "audit-001",
    timestamp: "2024-01-15T14:30:00Z",
    userId: "admin-001",
    userEmail: "admin@puffpass.com",
    userRole: "admin",
    action: "JWT_ROTATION_COMPLETED",
    resource: "security/jwt",
    outcome: "success",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    details: {
      oldSecretHash: "sha256:abc123...",
      newSecretHash: "sha256:def456...",
      rotationReason: "scheduled_rotation",
      affectedSessions: 2847,
    },
    riskLevel: "low",
    sessionId: "sess_admin_001_20240115",
    location: "San Francisco, CA",
  },
  {
    id: "audit-002",
    timestamp: "2024-01-15T14:25:00Z",
    userId: "merchant-123",
    userEmail: "merchant@greenvallley.com",
    userRole: "merchant",
    action: "WITHDRAWAL_REQUEST_CREATED",
    resource: "financial/withdrawal",
    resourceId: "withdrawal-456",
    outcome: "success",
    ipAddress: "203.0.113.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    details: {
      amount: 1500.0,
      currency: "USD",
      processingFee: 37.5,
      bankAccount: "****1234",
    },
    riskLevel: "medium",
    sessionId: "sess_merchant_123_20240115",
    location: "Denver, CO",
  },
  {
    id: "audit-003",
    timestamp: "2024-01-15T14:20:00Z",
    userId: "customer-789",
    userEmail: "customer@example.com",
    userRole: "customer",
    action: "LOGIN_FAILED",
    resource: "auth/login",
    outcome: "failure",
    ipAddress: "198.51.100.25",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    details: {
      reason: "invalid_password",
      attemptCount: 3,
      lockoutTriggered: false,
      mfaRequired: true,
    },
    riskLevel: "high",
    sessionId: "sess_failed_20240115_142000",
    location: "Los Angeles, CA",
  },
  {
    id: "audit-004",
    timestamp: "2024-01-15T14:15:00Z",
    userId: "admin-001",
    userEmail: "admin@puffpass.com",
    userRole: "admin",
    action: "USER_STATUS_CHANGED",
    resource: "user/management",
    resourceId: "user-456",
    outcome: "success",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    details: {
      targetUser: "suspicious@example.com",
      oldStatus: "active",
      newStatus: "suspended",
      reason: "suspicious_activity",
    },
    riskLevel: "medium",
    sessionId: "sess_admin_001_20240115",
    location: "San Francisco, CA",
  },
  {
    id: "audit-005",
    timestamp: "2024-01-15T14:10:00Z",
    userId: "system",
    userEmail: "system@puffpass.com",
    userRole: "admin",
    action: "SECURITY_SCAN_COMPLETED",
    resource: "security/scan",
    outcome: "warning",
    ipAddress: "127.0.0.1",
    userAgent: "PuffPass-SecurityBot/1.0",
    details: {
      scanType: "vulnerability_assessment",
      issuesFound: 2,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 2,
      lowIssues: 0,
    },
    riskLevel: "medium",
    sessionId: "sess_system_scan_20240115",
    location: "Internal",
  },
  {
    id: "audit-006",
    timestamp: "2024-01-15T14:05:00Z",
    userId: "merchant-456",
    userEmail: "merchant@cannabiscorner.com",
    userRole: "merchant",
    action: "PASSKEY_REGISTERED",
    resource: "auth/passkey",
    outcome: "success",
    ipAddress: "203.0.113.67",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    details: {
      passkeyId: "passkey_abc123",
      authenticatorType: "platform",
      credentialType: "public-key",
    },
    riskLevel: "low",
    sessionId: "sess_merchant_456_20240115",
    location: "Seattle, WA",
  },
]

export function SecurityAuditLog({ className }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>(mockAuditLogs)
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>(mockAuditLogs)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [outcomeFilter, setOutcomeFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [dateRange, setDateRange] = useState("24h")

  // Filter logs based on current filters
  useEffect(() => {
    let filtered = logs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ipAddress.includes(searchTerm),
      )
    }

    // Action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action.toLowerCase().includes(actionFilter.toLowerCase()))
    }

    // Outcome filter
    if (outcomeFilter !== "all") {
      filtered = filtered.filter((log) => log.outcome === outcomeFilter)
    }

    // Risk filter
    if (riskFilter !== "all") {
      filtered = filtered.filter((log) => log.riskLevel === riskFilter)
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((log) => log.userRole === roleFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, actionFilter, outcomeFilter, riskFilter, roleFilter])

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "success":
        return "bg-green-100 text-green-800 border-green-300"
      case "failure":
        return "bg-red-100 text-red-800 border-red-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN") || action.includes("AUTH")) return <Shield className="w-4 h-4" />
    if (action.includes("JWT") || action.includes("KEY")) return <Key className="w-4 h-4" />
    if (action.includes("USER") || action.includes("ADMIN")) return <User className="w-4 h-4" />
    if (action.includes("DATABASE") || action.includes("DATA")) return <Database className="w-4 h-4" />
    if (action.includes("SECURITY") || action.includes("SCAN")) return <AlertTriangle className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "User", "Action", "Resource", "Outcome", "Risk Level", "IP Address", "Location"].join(","),
      ...filteredLogs.map((log) =>
        [
          log.timestamp,
          log.userEmail,
          log.action,
          log.resource,
          log.outcome,
          log.riskLevel,
          log.ipAddress,
          log.location || "Unknown",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Security Audit Log</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive audit trail for compliance and security monitoring
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="security-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-foreground">{filteredLogs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Actions</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredLogs.filter((log) => log.outcome === "failure").length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredLogs.filter((log) => log.riskLevel === "high" || log.riskLevel === "critical").length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Actions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredLogs.filter((log) => log.userRole === "admin").length}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="security-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Audit Log Filters</CardTitle>
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="jwt">JWT</SelectItem>
                <SelectItem value="user">User Management</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>

            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="User Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="merchant">Merchant</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="security-card">
        <CardHeader>
          <CardTitle>Audit Trail ({filteredLogs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No audit logs match the current filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {log.userRole}
                          </Badge>
                          <span className="text-sm">{log.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm font-medium">{log.action.replace(/_/g, " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{log.resource}</span>
                        {log.resourceId && <div className="text-xs text-muted-foreground">ID: {log.resourceId}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge className={getOutcomeColor(log.outcome)}>{log.outcome}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(log.riskLevel)}>{log.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{log.location || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground font-mono">{log.ipAddress}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Detail Dialog */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getActionIcon(selectedLog.action)}
                Audit Log Details
              </DialogTitle>
              <DialogDescription>
                {selectedLog.action.replace(/_/g, " ")} by {selectedLog.userEmail}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                    <p className="text-sm font-mono">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {selectedLog.userRole}
                      </Badge>
                      <span className="text-sm">{selectedLog.userEmail}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Action</label>
                    <p className="text-sm font-medium">{selectedLog.action.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resource</label>
                    <p className="text-sm font-mono">{selectedLog.resource}</p>
                    {selectedLog.resourceId && (
                      <p className="text-xs text-muted-foreground">ID: {selectedLog.resourceId}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Outcome</label>
                    <div>
                      <Badge className={getOutcomeColor(selectedLog.outcome)}>{selectedLog.outcome}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Risk Level</label>
                    <div>
                      <Badge className={getRiskColor(selectedLog.riskLevel)}>{selectedLog.riskLevel}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                    <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-sm">{selectedLog.location || "Unknown"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                    <p className="text-sm font-mono">{selectedLog.sessionId}</p>
                  </div>
                </div>
              </div>

              {/* User Agent */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{selectedLog.userAgent}</p>
              </div>

              {/* Details */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Event Details</label>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(selectedLog.details, null, 2)}</pre>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
