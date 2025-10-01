"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp } from "lucide-react"

interface DeploymentMetricsProps {
  deployment: {
    build_time?: number
    status: string
  }
}

export function DeploymentMetrics({ deployment }: DeploymentMetricsProps) {
  const buildDuration = deployment.build_time || 0
  const coldBootDuration = Math.floor(Math.random() * 100) + 50 // Mock data
  const edgeRequests = Math.floor(Math.random() * 2000) + 500 // Mock data
  const bandwidth = (Math.random() * 5 + 0.5).toFixed(1) // Mock data

  return (
    <Card className="deployment-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Build Performance */}
        {buildDuration > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Build Duration</span>
              <span className="text-sm font-semibold text-foreground">{buildDuration}s</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-[var(--deployment-success)] h-2 rounded-full transition-all"
                style={{ width: `${Math.min((buildDuration / 300) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {buildDuration < 200 ? "Excellent" : buildDuration < 300 ? "Good" : "Average"} performance
            </p>
          </div>
        )}

        {/* Cold Boot */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Cold Boot Time</span>
            <span className="text-sm font-semibold text-foreground">{coldBootDuration}ms</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-[var(--deployment-success)] h-2 rounded-full transition-all"
              style={{ width: `${Math.min((coldBootDuration / 200) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Excellent performance</p>
        </div>

        {/* Request Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Edge Requests</p>
            <p className="text-2xl font-semibold text-foreground">{edgeRequests}</p>
            <p className="text-xs text-[var(--deployment-success)] mt-1">+12% from last deployment</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Bandwidth Used</p>
            <p className="text-2xl font-semibold text-foreground">{bandwidth} GB</p>
            <p className="text-xs text-muted-foreground mt-1">Within limits</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
