"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface ApiEndpointStatus {
  endpoint: string
  name: string
  status: "checking" | "success" | "error" | "warning"
  message?: string
  responseTime?: number
}

export function ApiStatusIndicator() {
  const [endpoints, setEndpoints] = useState<ApiEndpointStatus[]>([
    { endpoint: "/api/puff-balance", name: "Puff Balance", status: "checking" },
    { endpoint: "/api/transactions", name: "Transactions", status: "checking" },
    { endpoint: "/api/puff-points", name: "Puff Points", status: "checking" },
    { endpoint: "/api/products", name: "Products", status: "checking" },
    { endpoint: "/api/orders", name: "Orders", status: "checking" },
  ])

  useEffect(() => {
    const checkEndpoints = async () => {
      const updatedEndpoints = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const startTime = Date.now()
            const response = await fetch(endpoint.endpoint)
            const responseTime = Date.now() - startTime

            const contentType = response.headers.get("content-type")

            if (!response.ok) {
              return {
                ...endpoint,
                status: "error" as const,
                message: `HTTP ${response.status}`,
                responseTime,
              }
            }

            if (!contentType || !contentType.includes("application/json")) {
              return {
                ...endpoint,
                status: "warning" as const,
                message: "Non-JSON response",
                responseTime,
              }
            }

            // Try to parse JSON
            await response.json()

            return {
              ...endpoint,
              status: "success" as const,
              message: `${responseTime}ms`,
              responseTime,
            }
          } catch (error) {
            return {
              ...endpoint,
              status: "error" as const,
              message: error instanceof Error ? error.message : "Unknown error",
            }
          }
        }),
      )

      setEndpoints(updatedEndpoints)
    }

    checkEndpoints()
  }, [])

  const getStatusIcon = (status: ApiEndpointStatus["status"]) => {
    switch (status) {
      case "checking":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: ApiEndpointStatus["status"]) => {
    switch (status) {
      case "checking":
        return <Badge variant="secondary">Checking</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
    }
  }

  const successCount = endpoints.filter((e) => e.status === "success").length
  const totalCount = endpoints.length

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground">API Status</h3>
          <Badge variant={successCount === totalCount ? "default" : "secondary"}>
            {successCount}/{totalCount} Online
          </Badge>
        </div>

        <div className="space-y-2">
          {endpoints.map((endpoint) => (
            <div key={endpoint.endpoint} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {getStatusIcon(endpoint.status)}
                <span className="text-foreground">{endpoint.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {endpoint.message && <span className="text-muted-foreground text-xs">{endpoint.message}</span>}
                {getStatusBadge(endpoint.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
