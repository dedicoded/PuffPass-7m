"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Search } from "lucide-react"
import { useState } from "react"

interface DeploymentLogsProps {
  type: "build" | "runtime"
  deploymentId: string
}

export function DeploymentLogs({ type, deploymentId }: DeploymentLogsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const buildLogs = [
    { timestamp: new Date().toISOString(), level: "info", message: "Installing dependencies..." },
    { timestamp: new Date().toISOString(), level: "info", message: "Running build command: next build" },
    { timestamp: new Date().toISOString(), level: "info", message: "Compiled successfully" },
    { timestamp: new Date().toISOString(), level: "info", message: "Collecting page data..." },
    { timestamp: new Date().toISOString(), level: "info", message: "Generating static pages (0/12)" },
    { timestamp: new Date().toISOString(), level: "info", message: "Generating static pages (12/12)" },
    { timestamp: new Date().toISOString(), level: "success", message: "Build completed successfully" },
    { timestamp: new Date().toISOString(), level: "info", message: "Uploading build outputs..." },
    { timestamp: new Date().toISOString(), level: "success", message: "Deployment ready" },
  ]

  const runtimeLogs = [
    { timestamp: new Date().toISOString(), level: "info", message: "GET /api/deployments 200 45ms" },
    { timestamp: new Date().toISOString(), level: "info", message: "GET / 200 123ms" },
    { timestamp: new Date().toISOString(), level: "info", message: "GET /api/user 200 67ms" },
    { timestamp: new Date().toISOString(), level: "warning", message: "Slow query detected: 1.2s" },
    { timestamp: new Date().toISOString(), level: "info", message: "POST /api/data 201 89ms" },
  ]

  const logs = type === "build" ? buildLogs : runtimeLogs

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-[var(--deployment-success)]"
      case "warning":
        return "text-[var(--deployment-warning)]"
      case "error":
        return "text-[var(--deployment-error)]"
      default:
        return "text-muted-foreground"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Card className="deployment-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{type === "build" ? "Build Logs" : "Runtime Logs"}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="deployment-filter pl-9 pr-4 h-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg border border-border p-4 font-mono text-sm max-h-[600px] overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-4 py-1 hover:bg-muted/50 px-2 -mx-2 rounded">
              <span className="text-muted-foreground text-xs whitespace-nowrap">{formatTimestamp(log.timestamp)}</span>
              <span className={`text-xs font-semibold uppercase min-w-[60px] ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
              <span className="text-foreground flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
