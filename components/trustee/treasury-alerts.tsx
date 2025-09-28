"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, AlertTriangle, TrendingDown, TrendingUp, X } from "lucide-react"

interface TreasuryAlert {
  id: string
  type: "warning" | "info" | "critical"
  title: string
  message: string
  timestamp: string
  dismissed?: boolean
}

export function TreasuryAlerts() {
  const [alerts, setAlerts] = useState<TreasuryAlert[]>([
    {
      id: "1",
      type: "warning",
      title: "Yield Performance",
      message: "Monthly yield dropped to $3,850 — consider reviewing allocation strategy",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    },
    {
      id: "2",
      type: "info",
      title: "Redemption Activity",
      message: "Redemptions increased 42% this week — merchant fees may need adjustment",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: "3",
      type: "critical",
      title: "Reserve Ratio",
      message: "Reserve ratio below 80% threshold — immediate attention required",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    },
  ])

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, dismissed: true } : alert)))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <TrendingDown className="h-4 w-4 text-orange-500" />
      case "info":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "critical":
        return "destructive"
      case "warning":
        return "default"
      case "info":
        return "default"
      default:
        return "default"
    }
  }

  const activeAlerts = alerts.filter((alert) => !alert.dismissed)
  const criticalAlerts = activeAlerts.filter((alert) => alert.type === "critical")

  return (
    <Card className="treasury-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Treasury Alerts
          </CardTitle>
          <Badge variant={criticalAlerts.length > 0 ? "destructive" : "secondary"}>{activeAlerts.length} Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active alerts</p>
            <p className="text-sm text-muted-foreground">All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.type) as any}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm">{alert.message}</AlertDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-6 w-6 p-0 hover:bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Alert Settings */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="font-medium text-sm">Alert Thresholds</h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Reserve Ratio Warning</span>
              <span>{"< 85%"}</span>
            </div>
            <div className="flex justify-between">
              <span>Reserve Ratio Critical</span>
              <span>{"< 80%"}</span>
            </div>
            <div className="flex justify-between">
              <span>Yield Drop Warning</span>
              <span>{"< $4,000/month"}</span>
            </div>
            <div className="flex justify-between">
              <span>Redemption Spike</span>
              <span>{">30% increase"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
