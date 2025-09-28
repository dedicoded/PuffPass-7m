"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, TrendingDown, Clock, Zap, Database, Server, Globe, Activity } from "lucide-react"

interface MetricData {
  id: string
  deployment_id: string
  metric_name: string
  metric_value: number
  unit: string | null
  recorded_at: string
}

interface DeploymentMetricsProps {
  deploymentId?: string
}

export function DeploymentMetrics({ deploymentId }: DeploymentMetricsProps) {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [loading, setLoading] = useState(false)

  // Sample metrics data
  const sampleMetrics = [
    {
      name: "Response Time",
      value: "245ms",
      change: "-12%",
      trend: "down",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      name: "Bundle Size",
      value: "2.4MB",
      change: "+5%",
      trend: "up",
      icon: Database,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      name: "Memory Usage",
      value: "512MB",
      change: "-8%",
      trend: "down",
      icon: Server,
      color: "text-green-600 dark:text-green-400",
    },
    {
      name: "Lighthouse Score",
      value: "95",
      change: "+3%",
      trend: "up",
      icon: Zap,
      color: "text-orange-600 dark:text-orange-400",
    },
  ]

  const performanceMetrics = [
    { label: "First Contentful Paint", value: "1.2s", status: "good" },
    { label: "Largest Contentful Paint", value: "2.1s", status: "good" },
    { label: "Cumulative Layout Shift", value: "0.05", status: "good" },
    { label: "First Input Delay", value: "12ms", status: "good" },
    { label: "Time to Interactive", value: "2.8s", status: "needs-improvement" },
    { label: "Total Blocking Time", value: "150ms", status: "needs-improvement" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "needs-improvement":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "poor":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sampleMetrics.map((metric, index) => {
          const Icon = metric.icon
          const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
          const trendColor = metric.trend === "up" ? "text-red-500" : "text-green-500"

          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted/50 ${metric.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <TrendIcon className={`w-4 h-4 mr-1 ${trendColor}`} />
                  <span className={`text-sm font-medium ${trendColor}`}>{metric.change}</span>
                  <span className="text-sm text-muted-foreground ml-1">vs last deploy</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="build">Build Metrics</TabsTrigger>
          <TabsTrigger value="runtime">Runtime</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Core Web Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{metric.label}</p>
                      <p className="text-lg font-semibold text-foreground mt-1">{metric.value}</p>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status === "good"
                        ? "Good"
                        : metric.status === "needs-improvement"
                          ? "Needs Work"
                          : "Poor"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="build" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Build Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Build Time</span>
                  <span className="font-mono text-sm">4m 32s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                  <span className="font-mono text-sm text-green-600">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dependencies</span>
                  <span className="font-mono text-sm">247 packages</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Output Size</span>
                  <span className="font-mono text-sm">2.4 MB</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Bundle Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">JavaScript</span>
                  <span className="font-mono text-sm">1.8 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CSS</span>
                  <span className="font-mono text-sm">245 KB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Images</span>
                  <span className="font-mono text-sm">356 KB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Other</span>
                  <span className="font-mono text-sm">89 KB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="runtime" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Server Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CPU Usage</span>
                  <span className="font-mono text-sm">23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Memory Usage</span>
                  <span className="font-mono text-sm">512 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Connections</span>
                  <span className="font-mono text-sm">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="font-mono text-sm">99.9%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Network Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Requests/min</span>
                  <span className="font-mono text-sm">1,456</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Error Rate</span>
                  <span className="font-mono text-sm text-green-600">0.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Response</span>
                  <span className="font-mono text-sm">245ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bandwidth</span>
                  <span className="font-mono text-sm">12.4 MB/s</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
