"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  GitBranch,
  GitCommit,
  Calendar,
  Timer,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  Zap,
  Globe,
  Server,
  Database,
  Settings,
} from "lucide-react"

interface Deployment {
  id: string
  project_name: string
  url: string
  status: "pending" | "building" | "ready" | "error" | "cancelled"
  environment: string
  branch: string
  commit_sha: string
  commit_message: string
  build_time: number | null
  deploy_time: number | null
  created_at: string
  updated_at: string
  log_count: number
  critical_alerts: number
  warning_alerts: number
}

interface DeploymentHistoryProps {
  projectName?: string
}

export function DeploymentHistory({ projectName }: DeploymentHistoryProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    project_name: projectName || "",
    environment: "",
    status: "",
    search: "",
  })

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  })

  useEffect(() => {
    fetchDeployments()
  }, [filters, pagination.offset])

  const fetchDeployments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filters.project_name) params.append("project_name", filters.project_name)
      if (filters.environment) params.append("environment", filters.environment)
      if (filters.status) params.append("status", filters.status)
      params.append("limit", pagination.limit.toString())
      params.append("offset", pagination.offset.toString())

      const response = await fetch(`/api/deployments/history?${params}`)
      const data = await response.json()

      if (response.ok) {
        setDeployments(data.deployments)
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore,
        }))
      }
    } catch (error) {
      console.error("Error fetching deployment history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "building":
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "cancelled":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "building":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
      case "ready":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
      case "error":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
      case "cancelled":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800"
      case "pending":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800"
    }
  }

  const getEnvironmentIcon = (environment: string) => {
    switch (environment.toLowerCase()) {
      case "production":
        return <Server className="w-4 h-4 text-green-600" />
      case "staging":
        return <Database className="w-4 h-4 text-yellow-600" />
      case "development":
        return <Settings className="w-4 h-4 text-blue-600" />
      default:
        return <Globe className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date),
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const openDetailsDialog = (deployment: Deployment) => {
    setSelectedDeployment(deployment)
    setIsDetailsDialogOpen(true)
  }

  const nextPage = () => {
    if (pagination.hasMore) {
      setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }))
    }
  }

  const prevPage = () => {
    if (pagination.offset > 0) {
      setPagination((prev) => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))
    }
  }

  const filteredDeployments = deployments.filter((deployment) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        deployment.project_name.toLowerCase().includes(searchLower) ||
        deployment.branch.toLowerCase().includes(searchLower) ||
        deployment.commit_message.toLowerCase().includes(searchLower) ||
        deployment.commit_sha.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Deployment History</h2>
            <p className="text-muted-foreground">View and manage your deployment history</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{pagination.total} total deployments</span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search deployments..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <Select
                  value={filters.environment}
                  onValueChange={(value) => setFilters({ ...filters, environment: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All environments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All environments</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="preview">Preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="building">Building</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button variant="outline" onClick={fetchDeployments} className="w-full bg-transparent">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployments List */}
      <div className="space-y-4">
        {filteredDeployments.map((deployment) => {
          const createdDate = formatDate(deployment.created_at)

          return (
            <Card key={deployment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deployment.status)}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{deployment.project_name}</span>
                        <Badge className={getStatusColor(deployment.status)}>{deployment.status}</Badge>
                        <div className="flex items-center gap-1">
                          {getEnvironmentIcon(deployment.environment)}
                          <span className="text-sm text-muted-foreground">{deployment.environment}</span>
                        </div>
                      </div>
                    </div>

                    {/* Git Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{deployment.branch}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitCommit className="w-4 h-4" />
                        <span className="font-mono">{deployment.commit_sha.substring(0, 7)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{createdDate.relative}</span>
                      </div>
                    </div>

                    {/* Commit Message */}
                    <p className="text-sm text-foreground truncate max-w-2xl">{deployment.commit_message}</p>

                    {/* Metrics */}
                    <div className="flex items-center gap-6 text-sm">
                      {deployment.build_time && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Timer className="w-4 h-4" />
                          <span>Build: {formatDuration(deployment.build_time)}</span>
                        </div>
                      )}
                      {deployment.deploy_time && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Zap className="w-4 h-4" />
                          <span>Deploy: {formatDuration(deployment.deploy_time)}</span>
                        </div>
                      )}
                      {deployment.log_count > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>{deployment.log_count} logs</span>
                        </div>
                      )}
                      {deployment.critical_alerts > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>{deployment.critical_alerts} critical</span>
                        </div>
                      )}
                      {deployment.warning_alerts > 0 && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{deployment.warning_alerts} warnings</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {deployment.url && deployment.status === "ready" && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openDetailsDialog(deployment)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredDeployments.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No deployments found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of{" "}
            {pagination.total} deployments
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={pagination.offset === 0}>
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={!pagination.hasMore}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Deployment Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDeployment && getStatusIcon(selectedDeployment.status)}
              Deployment Details
            </DialogTitle>
          </DialogHeader>
          {selectedDeployment && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Project</Label>
                    <p className="text-foreground">{selectedDeployment.project_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Environment</Label>
                    <div className="flex items-center gap-2">
                      {getEnvironmentIcon(selectedDeployment.environment)}
                      <span>{selectedDeployment.environment}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge className={getStatusColor(selectedDeployment.status)}>{selectedDeployment.status}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">URL</Label>
                    {selectedDeployment.url ? (
                      <a
                        href={selectedDeployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {selectedDeployment.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Git Info */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Git Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Branch</Label>
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{selectedDeployment.branch}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Commit SHA</Label>
                      <div className="flex items-center gap-1">
                        <GitCommit className="w-4 h-4" />
                        <span className="font-mono">{selectedDeployment.commit_sha}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Commit Message</Label>
                    <p className="text-foreground bg-muted p-3 rounded text-sm">{selectedDeployment.commit_message}</p>
                  </div>
                </div>

                <Separator />

                {/* Timing Info */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Timing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="text-foreground">
                        {formatDate(selectedDeployment.created_at).date} at{" "}
                        {formatDate(selectedDeployment.created_at).time}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Updated</Label>
                      <p className="text-foreground">
                        {formatDate(selectedDeployment.updated_at).date} at{" "}
                        {formatDate(selectedDeployment.updated_at).time}
                      </p>
                    </div>
                    {selectedDeployment.build_time && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Build Time</Label>
                        <p className="text-foreground">{formatDuration(selectedDeployment.build_time)}</p>
                      </div>
                    )}
                    {selectedDeployment.deploy_time && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Deploy Time</Label>
                        <p className="text-foreground">{formatDuration(selectedDeployment.deploy_time)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Alerts and Logs Summary */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded">
                      <div className="text-2xl font-bold text-foreground">{selectedDeployment.log_count}</div>
                      <div className="text-sm text-muted-foreground">Log Entries</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded">
                      <div className="text-2xl font-bold text-red-600">{selectedDeployment.critical_alerts}</div>
                      <div className="text-sm text-red-600">Critical Alerts</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded">
                      <div className="text-2xl font-bold text-yellow-600">{selectedDeployment.warning_alerts}</div>
                      <div className="text-sm text-yellow-600">Warnings</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
