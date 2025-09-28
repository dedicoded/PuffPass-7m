"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  GitBranch,
  Clock,
  CheckCircle,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Search,
  Filter,
  Loader2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Deployment {
  id: string
  project_id: string
  deployment_url: string | null
  branch_name: string
  commit_hash: string | null
  commit_message: string | null
  status: "building" | "ready" | "error" | "cancelled"
  environment: "production" | "preview" | "development"
  build_time_seconds: number | null
  deployed_by: string | null
  created_at: string
  completed_at: string | null
}

interface DeploymentsListProps {
  initialDeployments?: Deployment[]
}

export function DeploymentsList({ initialDeployments = [] }: DeploymentsListProps) {
  const [deployments, setDeployments] = useState<Deployment[]>(initialDeployments)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [environmentFilter, setEnvironmentFilter] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "building":
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
      case "error":
        return <XCircle className="w-3 h-3 text-red-500" />
      case "cancelled":
        return <AlertCircle className="w-3 h-3 text-yellow-500" />
      default:
        return <Clock className="w-3 h-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "building":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "cancelled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case "production":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
      case "preview":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
      case "development":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800"
    }
  }

  const formatBuildTime = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredDeployments = deployments.filter((deployment) => {
    const matchesSearch =
      deployment.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deployment.commit_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deployment.commit_message?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || deployment.status === statusFilter
    const matchesEnvironment = environmentFilter === "all" || deployment.environment === environmentFilter

    return matchesSearch && matchesStatus && matchesEnvironment
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by branch, commit, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="building">Building</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Deployments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading deployments...</span>
          </div>
        ) : filteredDeployments.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No deployments found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDeployments.map((deployment) => (
            <Card key={deployment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge className={`px-3 py-1 ${getStatusColor(deployment.status)}`}>
                        {getStatusIcon(deployment.status)}
                        <span className="ml-1 capitalize">{deployment.status}</span>
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-foreground truncate">{deployment.id}</span>
                          <Badge variant="outline" className={`text-xs ${getEnvironmentColor(deployment.environment)}`}>
                            {deployment.environment}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GitBranch className="w-3 h-3 flex-shrink-0" />
                          <span className="font-mono truncate">{deployment.branch_name}</span>
                          {deployment.commit_hash && (
                            <>
                              <span className="font-mono text-xs bg-muted px-1 rounded">
                                {deployment.commit_hash.substring(0, 7)}
                              </span>
                              <span className="truncate">{deployment.commit_message}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right text-sm hidden sm:block">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatBuildTime(deployment.build_time_seconds)}</span>
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(deployment.created_at), { addSuffix: true })}
                        {deployment.deployed_by && <span> by {deployment.deployed_by}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {deployment.deployment_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(deployment.deployment_url!)}
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                      {deployment.deployment_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(deployment.deployment_url!, "_blank")}
                          title="Open deployment"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="More options">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
