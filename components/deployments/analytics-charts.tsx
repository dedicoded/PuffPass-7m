"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Clock, Users, GitBranch, AlertTriangle } from "lucide-react"
import { useState } from "react"

interface AnalyticsData {
  stats: {
    total_deployments: number
    successful_deployments: number
    failed_deployments: number
    building_deployments: number
    avg_build_time: number
    min_build_time: number
    max_build_time: number
  }
  deploymentsByEnvironment: Array<{
    environment: string
    count: number
    successful: number
    failed: number
  }>
  deploymentsByDay: Array<{
    date: string
    total: number
    successful: number
    failed: number
  }>
  topContributors: Array<{
    deployed_by: string
    deployment_count: number
    successful_count: number
    avg_build_time: number
  }>
  branchActivity: Array<{
    branch_name: string
    deployment_count: number
    successful_count: number
    last_deployment: string
  }>
  recentFailures: Array<{
    id: string
    deployment_id: string
    branch_name: string
    commit_hash: string
    commit_message: string
    environment: string
    created_at: string
    deployed_by: string
    project_name: string
  }>
}

interface AnalyticsChartsProps {
  data?: AnalyticsData
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [environment, setEnvironment] = useState("all")

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const successRate =
    data.stats.total_deployments > 0
      ? ((data.stats.successful_deployments / data.stats.total_deployments) * 100).toFixed(1)
      : "0"

  const formatBuildTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={environment} onValueChange={setEnvironment}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="preview">Preview</SelectItem>
            <SelectItem value="development">Development</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Deployments</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {data.stats.total_deployments}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Success Rate</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{successRate}%</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">
                {data.stats.successful_deployments} successful
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Build Time</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {formatBuildTime(data.stats.avg_build_time || 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                Range: {formatBuildTime(data.stats.min_build_time || 0)} -{" "}
                {formatBuildTime(data.stats.max_build_time || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Failed Deployments</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-1">
                  {data.stats.failed_deployments}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-red-600 dark:text-red-400 font-medium">
                {((data.stats.failed_deployments / data.stats.total_deployments) * 100).toFixed(1)}% failure rate
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Deployments by Environment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.deploymentsByEnvironment.map((env) => {
                const successRate = env.count > 0 ? ((env.successful / env.count) * 100).toFixed(1) : "0"
                return (
                  <div key={env.environment} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          env.environment === "production"
                            ? "bg-green-500"
                            : env.environment === "preview"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-foreground capitalize">{env.environment}</p>
                        <p className="text-sm text-muted-foreground">{env.count} deployments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        {successRate}% success
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {env.successful} success, {env.failed} failed
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topContributors.slice(0, 5).map((contributor, index) => {
                const successRate =
                  contributor.deployment_count > 0
                    ? ((contributor.successful_count / contributor.deployment_count) * 100).toFixed(1)
                    : "0"
                return (
                  <div
                    key={contributor.deployed_by}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {contributor.deployed_by.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{contributor.deployed_by}</p>
                        <p className="text-sm text-muted-foreground">{contributor.deployment_count} deployments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        {successRate}% success
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Avg: {formatBuildTime(contributor.avg_build_time || 0)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Activity & Recent Failures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Branch Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.branchActivity.slice(0, 8).map((branch) => {
                const successRate =
                  branch.deployment_count > 0
                    ? ((branch.successful_count / branch.deployment_count) * 100).toFixed(1)
                    : "0"
                return (
                  <div key={branch.branch_name} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <GitBranch className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm text-foreground truncate">{branch.branch_name}</p>
                        <p className="text-xs text-muted-foreground">{branch.deployment_count} deployments</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {successRate}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recent Failures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentFailures.slice(0, 5).map((failure) => (
                <div
                  key={failure.id}
                  className="p-3 border rounded border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      >
                        {failure.environment}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">{failure.deployment_id}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(failure.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="w-3 h-3 text-muted-foreground" />
                    <span className="font-mono text-sm">{failure.branch_name}</span>
                    {failure.commit_hash && (
                      <span className="font-mono text-xs bg-muted px-1 rounded">
                        {failure.commit_hash.substring(0, 7)}
                      </span>
                    )}
                  </div>
                  {failure.commit_message && (
                    <p className="text-sm text-muted-foreground truncate">{failure.commit_message}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
