"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Clock,
  GitBranch,
  GitCommit,
  Globe,
  Copy,
  ExternalLink,
  Activity,
  Zap,
  Database,
  Server,
  AlertCircle,
  ChevronLeft,
  MoreVertical,
  User,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { DeploymentLogs } from "@/components/deployment-logs"
import { DeploymentMetrics } from "@/components/deployment-metrics"
import { DeploymentSource } from "@/components/deployment-source"
import { toast } from "sonner"

interface Deployment {
  deployment_id: string
  project_name: string
  branch: string
  commit_hash: string
  commit_message: string
  status: string
  environment: string
  url: string
  created_at: string
  deployed_at: string
  build_time: number
  author_name: string
  author_email: string
}

export function DeploymentDetailsClient({ id }: { id: string }) {
  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeployment = async () => {
      try {
        const response = await fetch(`/api/deployments/${id}`)
        if (!response.ok) throw new Error("Failed to fetch deployment")
        const data = await response.json()
        setDeployment(data.deployment)
      } catch (error) {
        console.error("Error fetching deployment:", error)
        toast.error("Failed to load deployment details")
      } finally {
        setLoading(false)
      }
    }

    fetchDeployment()
  }, [id])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready":
      case "success":
        return "text-[var(--deployment-ready)]"
      case "building":
      case "pending":
        return "text-[var(--deployment-pending)]"
      case "error":
      case "failed":
        return "text-[var(--deployment-error)]"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready":
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5" />
      case "building":
      case "pending":
        return <Clock className="w-3.5 h-3.5 animate-spin" />
      case "error":
      case "failed":
        return <AlertCircle className="w-3.5 h-3.5" />
      default:
        return <Activity className="w-3.5 h-3.5" />
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return "just now"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading deployment details...</p>
        </div>
      </div>
    )
  }

  if (!deployment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
          <h2 className="text-2xl font-semibold text-foreground">Deployment Not Found</h2>
          <p className="text-muted-foreground">The deployment you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/deployments">Back to Deployments</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="deployment-header sticky top-0 z-10 backdrop-blur-sm bg-background/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/deployments">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground font-mono">{deployment.deployment_id}</h1>
                <Badge
                  variant="outline"
                  className={`deployment-status flex items-center gap-1.5 ${getStatusColor(deployment.status)}`}
                >
                  {getStatusIcon(deployment.status)}
                  {deployment.status}
                </Badge>
                <Badge variant="secondary">{deployment.environment}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {deployment.project_name} • {formatTimeAgo(deployment.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {deployment.url && (
              <Button variant="outline" size="sm" asChild>
                <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="deployment-metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Build Time</span>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {deployment.build_time ? formatDuration(deployment.build_time) : "N/A"}
                  </p>
                </CardContent>
              </Card>

              <Card className="deployment-metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-medium">Status</span>
                  </div>
                  <p className={`text-2xl font-semibold ${getStatusColor(deployment.status)}`}>{deployment.status}</p>
                </CardContent>
              </Card>

              <Card className="deployment-metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-medium">Environment</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{deployment.environment}</p>
                </CardContent>
              </Card>

              <Card className="deployment-metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-medium">Branch</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground font-mono truncate">{deployment.branch}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Build Logs
                </TabsTrigger>
                <TabsTrigger
                  value="source"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Source
                </TabsTrigger>
                <TabsTrigger
                  value="runtime"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Runtime Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <DeploymentMetrics deployment={deployment} />

                {/* Domains */}
                {deployment.url && (
                  <Card className="deployment-card">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Domains
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[var(--deployment-success)]" />
                          <div>
                            <p className="font-mono text-sm font-medium text-foreground">{deployment.url}</p>
                            <p className="text-xs text-muted-foreground">{deployment.environment} Domain</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(deployment.url)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Environment Variables */}
                <Card className="deployment-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      Environment Variables
                    </CardTitle>
                    <CardDescription>Variables available during build and runtime</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {["POSTGRES_URL", "DATABASE_URL", "NEXT_PUBLIC_VERCEL_URL", "KV_REST_API_URL"].map((envVar) => (
                        <div
                          key={envVar}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                        >
                          <span className="font-mono text-sm text-foreground">{envVar}</span>
                          <Badge variant="secondary" className="text-xs">
                            Set
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="mt-6">
                <DeploymentLogs type="build" deploymentId={deployment.deployment_id} />
              </TabsContent>

              <TabsContent value="source" className="mt-6">
                <DeploymentSource deployment={deployment} />
              </TabsContent>

              <TabsContent value="runtime" className="mt-6">
                <DeploymentLogs type="runtime" deploymentId={deployment.deployment_id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Deployment Info */}
            <Card className="deployment-card">
              <CardHeader>
                <CardTitle className="text-base">Deployment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deployment.status)}
                    <span className={`text-sm font-medium ${getStatusColor(deployment.status)}`}>
                      {deployment.status}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Environment</p>
                  <p className="text-sm font-medium text-foreground">{deployment.environment}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Project</p>
                  <p className="text-sm font-medium text-foreground">{deployment.project_name}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(deployment.created_at).toLocaleString()}
                  </p>
                </div>

                {deployment.deployed_at && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deployed</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(deployment.deployed_at).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Git Info */}
            <Card className="deployment-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Git Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Branch</p>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium font-mono text-foreground">{deployment.branch}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Commit</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <GitCommit className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono text-foreground">{deployment.commit_hash}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(deployment.commit_hash)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    {deployment.commit_message && (
                      <p className="text-sm text-foreground leading-relaxed">{deployment.commit_message}</p>
                    )}
                  </div>
                </div>

                {deployment.author_name && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Author</p>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{deployment.author_name}</span>
                      </div>
                      {deployment.author_email && (
                        <p className="text-xs text-muted-foreground mt-1">{deployment.author_email}</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Checks */}
            <Card className="deployment-card">
              <CardHeader>
                <CardTitle className="text-base">Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {deployment.status === "ready" || deployment.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--deployment-success)]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[var(--deployment-pending)]" />
                    )}
                    <span className="text-sm text-foreground">Build Status</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {deployment.url ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--deployment-success)]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[var(--deployment-warning)]" />
                    )}
                    <span className="text-sm text-foreground">Deployment URL</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--deployment-success)]" />
                    <span className="text-sm text-foreground">DNS Configured</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
