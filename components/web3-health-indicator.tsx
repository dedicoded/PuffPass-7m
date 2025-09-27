"use client"

import { useWeb3Health } from "./web3-provider"
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"

export function Web3HealthIndicator() {
  const health = useWeb3Health()

  if (!health) return null

  const getStatusIcon = () => {
    switch (health.status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "unavailable":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "initializing":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (health.status) {
      case "connected":
        return "Web3 Connected"
      case "error":
        return "Web3 Error"
      case "unavailable":
        return "Web3 Unavailable"
      case "initializing":
        return "Web3 Initializing"
      default:
        return "Web3 Unknown"
    }
  }

  const getStatusColor = () => {
    switch (health.status) {
      case "connected":
        return "text-green-700 bg-green-50 border-green-200"
      case "error":
        return "text-red-700 bg-red-50 border-red-200"
      case "unavailable":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      case "initializing":
        return "text-blue-700 bg-blue-50 border-blue-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {health.isDemo && <span className="text-xs opacity-75">(Demo)</span>}
    </div>
  )
}

// Dashboard-ready detailed status component
export function Web3HealthDetails() {
  const health = useWeb3Health()

  if (!health) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Web3 Connection Status</h3>
        <Web3HealthIndicator />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="font-medium">{health.status}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Project ID:</span>
          <span className="font-mono text-xs">
            {health.isDemo ? "demo-project-id" : `${health.projectId.slice(0, 8)}...`}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Last Checked:</span>
          <span className="text-xs">{health.lastChecked.toLocaleTimeString()}</span>
        </div>

        {health.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-xs font-medium">Error Details:</p>
            <p className="text-red-600 text-xs mt-1">{health.error}</p>
          </div>
        )}

        {health.isDemo && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-700 text-xs font-medium">Production Notice:</p>
            <p className="text-yellow-600 text-xs mt-1">
              Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for reliable Web3 connectivity
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
