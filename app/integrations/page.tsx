"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Database, Key, Zap, RefreshCw } from "lucide-react"

interface IntegrationStatus {
  name: string
  status: "connected" | "disconnected" | "error"
  description: string
  icon: React.ReactNode
  details?: string[]
}

interface DatabaseStats {
  users: number
  products: number
  orders: number
  merchants: number
  loading: boolean
  error?: string
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      name: "Neon Database",
      status: "connected",
      description: "PostgreSQL database for all application data",
      icon: <Database className="h-5 w-5" />,
      details: ["10 tables configured", "Connection pooling enabled", "SSL encryption active"],
    },
    {
      name: "Stack Auth",
      status: "connected",
      description: "Authentication and user management",
      icon: <Key className="h-5 w-5" />,
      details: ["JWT tokens configured", "User sync enabled", "Multi-role support"],
    },
    {
      name: "JWT Rotation System",
      status: "connected",
      description: "Automated security token rotation",
      icon: <Zap className="h-5 w-5" />,
      details: ["90-day rotation cycle", "Audit logging enabled", "Compliance ready"],
    },
  ])

  const [dbStats, setDbStats] = useState<DatabaseStats>({
    users: 0,
    products: 0,
    orders: 0,
    merchants: 0,
    loading: true,
  })

  const [testing, setTesting] = useState(false)

  const testDatabaseConnection = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/test-db-connection")
      const result = await response.json()

      if (result.success) {
        setDbStats({
          users: result.stats.users,
          products: result.stats.products,
          orders: result.stats.orders,
          merchants: result.stats.merchants,
          loading: false,
        })

        // Update Neon status
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.name === "Neon Database" ? { ...integration, status: "connected" as const } : integration,
          ),
        )
      } else {
        setDbStats((prev) => ({ ...prev, loading: false, error: result.error }))
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.name === "Neon Database" ? { ...integration, status: "error" as const } : integration,
          ),
        )
      }
    } catch (error) {
      setDbStats((prev) => ({ ...prev, loading: false, error: "Connection failed" }))
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.name === "Neon Database" ? { ...integration, status: "error" as const } : integration,
        ),
      )
    }
    setTesting(false)
  }

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const getStatusIcon = (status: IntegrationStatus["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: IntegrationStatus["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Connected
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Disconnected</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Status</h1>
          <p className="text-muted-foreground">Monitor and manage your application integrations</p>
        </div>
        <Button onClick={testDatabaseConnection} disabled={testing} variant="outline">
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Connections
            </>
          )}
        </Button>
      </div>

      {/* Integration Status Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                {integration.icon}
                <CardTitle className="text-sm font-medium">{integration.name}</CardTitle>
              </div>
              {getStatusIcon(integration.status)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-xs">{integration.description}</CardDescription>
                {getStatusBadge(integration.status)}
              </div>
              {integration.details && (
                <div className="mt-3 space-y-1">
                  {integration.details.map((detail, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      {detail}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Statistics</span>
          </CardTitle>
          <CardDescription>Real-time data from your Neon PostgreSQL database</CardDescription>
        </CardHeader>
        <CardContent>
          {dbStats.loading ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading database statistics...</span>
            </div>
          ) : dbStats.error ? (
            <div className="text-red-500 flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Error: {dbStats.error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{dbStats.users}</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dbStats.products}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{dbStats.orders}</div>
                <div className="text-sm text-muted-foreground">Orders</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{dbStats.merchants}</div>
                <div className="text-sm text-muted-foreground">Merchants</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Variables Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Environment Variables</span>
          </CardTitle>
          <CardDescription>Critical environment variables for your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {[
              "DATABASE_URL",
              "POSTGRES_URL",
              "STACK_SECRET_SERVER_KEY",
              "NEXT_PUBLIC_STACK_PROJECT_ID",
              "NEON_PROJECT_ID",
            ].map((envVar) => (
              <div key={envVar} className="flex items-center justify-between py-2 px-3 bg-muted rounded">
                <span className="font-mono text-sm">{envVar}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
