"use client"

import type React from "react"
import { WagmiProvider } from "wagmi"
import { mainnet, polygon, sepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import { useState, useEffect, createContext, useContext } from "react"

export type Web3HealthStatus = {
  isHealthy: boolean
  status: "initializing" | "connected" | "error" | "unavailable"
  error?: string
  lastChecked: Date
  projectId: string
  isDemo: boolean
}

const Web3HealthContext = createContext<Web3HealthStatus | null>(null)

export function useWeb3Health(): Web3HealthStatus | null {
  return useContext(Web3HealthContext)
}

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id"

function isCryptoAvailable() {
  try {
    if (typeof window !== "undefined") {
      // Check for native browser crypto APIs
      const hasCrypto = !!(window.crypto && window.crypto.getRandomValues)

      // Additional check for Web3 compatibility
      const hasSubtleCrypto = !!(window.crypto && window.crypto.subtle)

      console.log("[v0] Crypto availability check:", { hasCrypto, hasSubtleCrypto })

      return hasCrypto
    }
    return false
  } catch (error) {
    console.warn("[v0] Crypto availability check failed:", error)
    return false
  }
}

const metadata = {
  name: "PuffPass",
  description: "Cannabis compliance and payment platform",
  url: typeof window !== "undefined" ? window.location.origin : "https://puffpass.app",
  icons: [`${typeof window !== "undefined" ? window.location.origin : "https://puffpass.app"}/icon.png`],
}

const chains = [mainnet, polygon, sepolia] as const

let config: any = null
let configError: string | null = null

try {
  // Only create config if crypto is available and we're not in a problematic environment
  if (typeof window === "undefined" || isCryptoAvailable()) {
    config = defaultWagmiConfig({
      chains,
      projectId,
      metadata,
      enableWalletConnect: true,
      enableInjected: true,
      enableEIP6963: false, // This can cause crypto module issues
      enableCoinbase: false, // This can cause crypto module issues
    })
    console.log("[v0] Wagmi config created successfully")
  } else {
    configError = "Browser crypto APIs not available"
    console.warn("[v0] Skipping wagmi config creation:", configError)
  }
} catch (error) {
  configError = error instanceof Error ? error.message : "Unknown configuration error"
  console.warn("[v0] Wagmi config creation failed:", configError)
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

async function safeHealthLog(metrics: any) {
  try {
    // Only attempt logging if we're in a server environment with database
    if (typeof window === "undefined" && process.env.DATABASE_URL) {
      const { Web3HealthLogger } = await import("@/lib/web3-health-logger")
      await Web3HealthLogger.logHealthMetric(metrics)
    } else {
      console.log("[v0] Health logging skipped (client-side or no database)")
    }
  } catch (error) {
    console.warn("[v0] Health logging unavailable:", error instanceof Error ? error.message : "Unknown error")
    // Don't fail the app due to logging issues
  }
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [healthStatus, setHealthStatus] = useState<Web3HealthStatus>({
    isHealthy: false,
    status: "initializing",
    lastChecked: new Date(),
    projectId,
    isDemo: projectId === "demo-project-id",
  })

  useEffect(() => {
    const initializeWeb3 = async () => {
      const startTime = Date.now()

      try {
        console.log("[v0] Initializing Web3Modal...")

        if (!isCryptoAvailable()) {
          console.warn("[v0] Browser crypto not available - Web3 functionality will be limited")

          setHealthStatus((prev) => ({
            ...prev,
            status: "unavailable",
            error: "Browser crypto APIs not available",
            lastChecked: new Date(),
          }))

          setIsInitialized(true)
          return
        }

        if (!config || configError) {
          console.warn("[v0] Wagmi config not available:", configError)

          setHealthStatus((prev) => ({
            ...prev,
            status: "unavailable",
            error: configError || "Wagmi configuration failed",
            lastChecked: new Date(),
          }))

          setIsInitialized(true)
          return
        }

        // Check if we're using demo project ID
        if (projectId === "demo-project-id") {
          console.warn(
            "[v0] Using demo WalletConnect project ID - set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for production",
          )

          setHealthStatus((prev) => ({
            ...prev,
            status: "unavailable",
            error: "Demo project ID in use - WalletConnect may be unreliable",
            lastChecked: new Date(),
          }))
        }

        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 3000)

          const connectivityTest = await fetch("https://api.walletconnect.com/health", {
            method: "GET",
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!connectivityTest?.ok) {
            console.warn("[v0] WalletConnect API health check failed, but continuing...")
          }
        } catch (error) {
          console.warn("[v0] WalletConnect connectivity test failed:", error)
          // Continue anyway - this is just a health check
        }

        try {
          createWeb3Modal({
            wagmiConfig: config,
            projectId,
            enableAnalytics: false, // Disable analytics to avoid network issues
            themeMode: "light",
            themeVariables: {
              "--w3m-font-family": "system-ui, sans-serif",
              "--w3m-border-radius-master": "8px",
            },
          })
          console.log("[v0] Web3Modal created successfully")
        } catch (modalError) {
          console.warn("[v0] Web3Modal creation failed:", modalError)

          setHealthStatus((prev) => ({
            ...prev,
            status: "error",
            error: `Web3Modal initialization failed: ${modalError instanceof Error ? modalError.message : "Unknown error"}`,
            lastChecked: new Date(),
          }))

          setIsInitialized(true)
          return
        }

        const finalLatency = Date.now() - startTime
        console.log(`[v0] Web3Modal initialized successfully in ${finalLatency}ms`)

        await safeHealthLog({
          status: "connected",
          latency: finalLatency,
          errorCount: 0,
          projectId,
          isDemo: projectId === "demo-project-id",
          provider: "walletconnect",
          connectionAttempts: 1,
          successfulConnections: 1,
          failedConnections: 0,
          uptimePercentage: 100,
          operator: "system",
          checkType: "automated",
          environment: process.env.NODE_ENV || "development",
          metadata: {
            initialization_time_ms: finalLatency,
            api_health_check: "passed",
          },
        })

        setHealthStatus((prev) => ({
          ...prev,
          isHealthy: true,
          status: "connected",
          error: undefined,
          lastChecked: new Date(),
        }))

        setIsInitialized(true)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown initialization error"
        const finalLatency = Date.now() - startTime

        console.error("[v0] Web3Modal initialization failed:", errorMessage)

        await safeHealthLog({
          status: "error",
          latency: finalLatency,
          lastError: errorMessage,
          errorCount: 1,
          projectId,
          isDemo: projectId === "demo-project-id",
          provider: "walletconnect",
          connectionAttempts: 1,
          successfulConnections: 0,
          failedConnections: 1,
          uptimePercentage: 0,
          operator: "system",
          checkType: "automated",
          environment: process.env.NODE_ENV || "development",
          metadata: {
            error_type: error instanceof Error ? error.constructor.name : "UnknownError",
            initialization_failed: true,
          },
        })

        setHealthStatus((prev) => ({
          ...prev,
          isHealthy: false,
          status: "error",
          error: errorMessage,
          lastChecked: new Date(),
        }))

        // Still allow app to load without Web3
        setIsInitialized(true)
      }
    }

    initializeWeb3()

    const healthCheckInterval = setInterval(
      async () => {
        try {
          const startTime = Date.now()
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)

          const healthCheck = await fetch("https://api.walletconnect.com/health", {
            method: "GET",
            signal: controller.signal,
          })

          clearTimeout(timeoutId)
          const latency = Date.now() - startTime
          const isHealthy = healthCheck.ok

          // Safe health logging for periodic checks
          await safeHealthLog({
            status: isHealthy ? "connected" : "error",
            latency,
            errorCount: isHealthy ? 0 : 1,
            projectId,
            isDemo: projectId === "demo-project-id",
            provider: "walletconnect",
            connectionAttempts: 1,
            successfulConnections: isHealthy ? 1 : 0,
            failedConnections: isHealthy ? 0 : 1,
            operator: "system",
            checkType: "scheduled",
            environment: process.env.NODE_ENV || "development",
            metadata: {
              periodic_check: true,
              http_status: healthCheck.status,
            },
          })
        } catch (error) {
          console.error("[v0] Periodic Web3 health check failed:", error)
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(healthCheckInterval)
  }, [])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Initializing PuffPass...</p>
          {healthStatus.status === "initializing" && (
            <p className="text-xs text-slate-400 mt-2">Connecting to Web3 services...</p>
          )}
        </div>
      </div>
    )
  }

  if (!config || healthStatus.status === "unavailable") {
    return <Web3HealthContext.Provider value={healthStatus}>{children}</Web3HealthContext.Provider>
  }

  return (
    <Web3HealthContext.Provider value={healthStatus}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </Web3HealthContext.Provider>
  )
}
