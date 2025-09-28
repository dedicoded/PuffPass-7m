"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  RefreshCw,
  Terminal,
  Zap,
} from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  message: string
  deployment_id?: string
}

interface DeploymentStatus {
  id: string
  status: "building" | "ready" | "error" | "cancelled"
  progress?: number
  currentStep?: string
  logs: LogEntry[]
}

export function RealTimeMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null)

  // Simulate real-time updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      // Simulate new log entries
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        level: ["info", "warn", "error", "debug"][Math.floor(Math.random() * 4)] as LogEntry["level"],
        message: [
          "Installing dependencies...",
          "Building application...",
          "Running tests...",
          "Optimizing bundle...",
          "Deploying to CDN...",
          "Health check passed",
          "Deployment completed successfully",
          "Warning: Bundle size increased",
          "Error: Build failed",
        ][Math.floor(Math.random() * 9)],
        deployment_id: selectedDeployment || undefined,
      }

      setLogs((prev) => [newLog, ...prev.slice(0, 99)]) // Keep last 100 logs
    }, 2000)

    return () => clearInterval(interval)
  }, [isMonitoring, selectedDeployment])

  // Sample deployment data
  useEffect(() => {
    setDeployments([
      {
        id: "dpl_001",
        status: "building",
        progress: 67,
        currentStep: "Building application",
        logs: [],
      },
      {
        id: "dpl_002",
        status: "ready",
        progress: 100,
        currentStep: "Deployment complete",
        logs: [],
      },
      {
        id: "dpl_003",
        status: "error",
        progress: 45,
        currentStep: "Build failed",
        logs: [],
      },
    ])
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "building":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "building":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "ready":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "cancelled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-500"
      case "warn":
        return "text-yellow-500"
      case "info":
        return "text-blue-500"
      case "debug":
        return "text-gray-500"
      default:
        return "text-foreground"
    }
  }

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="w-3 h-3" />
      case "warn":
        return <AlertCircle className="w-3 h-3" />
      case "info":
        return <CheckCircle className="w-3 h-3" />
      case "debug":
        return <Terminal className="w-3 h-3" />
      default:
        return <Activity className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Monitor Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Monitor
              {isMonitoring && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="flex items-center gap-2"
              >
                {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isMonitoring ? "Pause" : "Resume"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLogs([])}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>{logs.length} events</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last update: {logs[0]?.timestamp ? new Date(logs[0].timestamp).toLocaleTimeString() : "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Deployments */}
        <Card>
          <CardHeader>
            <CardTitle>Active Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDeployment === deployment.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedDeployment(deployment.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(deployment.status)}
                      <span className="font-mono text-sm">{deployment.id}</span>
                      <Badge className={getStatusColor(deployment.status)}>{deployment.status}</Badge>
                    </div>
                    {deployment.progress !== undefined && (
                      <span className="text-sm text-muted-foreground">{deployment.progress}%</span>
                    )}
                  </div>
                  {deployment.currentStep && (
                    <p className="text-sm text-muted-foreground mb-2">{deployment.currentStep}</p>
                  )}
                  {deployment.progress !== undefined && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          deployment.status === "building"
                            ? "bg-blue-500"
                            : deployment.status === "ready"
                              ? "bg-green-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${deployment.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Live Logs</CardTitle>
              <div className="flex items-center gap-2">
                {selectedDeployment && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedDeployment}
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedDeployment(null)}>
                  All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-2">
                {logs
                  .filter((log) => !selectedDeployment || log.deployment_id === selectedDeployment)
                  .map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-2 rounded text-sm hover:bg-muted/50">
                      <div className={`flex items-center gap-1 ${getLogLevelColor(log.level)} min-w-0 flex-shrink-0`}>
                        {getLogLevelIcon(log.level)}
                        <span className="text-xs uppercase font-mono">{log.level}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          {log.deployment_id && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {log.deployment_id}
                            </Badge>
                          )}
                        </div>
                        <p className="text-foreground break-words">{log.message}</p>
                      </div>
                    </div>
                  ))}
                {logs.length === 0 && (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Terminal className="w-8 h-8 mb-2" />
                    <p>No logs available. Start monitoring to see real-time updates.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-foreground">Build Queue</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-foreground">CDN Status</p>
              <p className="text-xs text-muted-foreground">Operational</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-foreground">API Gateway</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-sm font-medium text-foreground">Database</p>
              <p className="text-xs text-muted-foreground">Degraded</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
