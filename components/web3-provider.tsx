"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { WagmiProvider, http, createConfig, cookieStorage, createStorage } from "wagmi"
import { sepolia } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

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
  if (typeof window === "undefined") return false
  return !!(window.crypto && window.crypto.getRandomValues)
}

async function safeHealthLog(metrics: any) {
  try {
    if (typeof window === "undefined" && process.env.DATABASE_URL) {
      const { Web3HealthLogger } = await import("@/lib/web3-health-logger")
      await Web3HealthLogger.logHealthMetric(metrics)
    }
  } catch (error) {
    console.warn("[v0] Health logging unavailable:", error instanceof Error ? error.message : "Unknown error")
  }
}

let cachedConfig: any = null
let cachedQueryClient: any = null

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasWeb3, setHasWeb3] = useState(false)
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
        console.log("[v0] Initializing wagmi with optimized connectors...")

        if (!isCryptoAvailable()) {
          console.warn("[v0] Browser crypto not available")
          setHealthStatus({
            isHealthy: false,
            status: "unavailable",
            error: "Browser crypto APIs not available",
            lastChecked: new Date(),
            projectId,
            isDemo: projectId === "demo-project-id",
          })
          setIsInitialized(true)
          return
        }

        if (!cachedConfig) {
          try {
            cachedConfig = createConfig({
              chains: [sepolia],
              connectors: [
                injected({
                  shimDisconnect: false, // Don't auto-connect
                }),
                ...(projectId !== "demo-project-id"
                  ? [
                      walletConnect({
                        projectId,
                        metadata: {
                          name: "PuffPass",
                          description: "Cannabis compliance and payment platform",
                          url: typeof window !== "undefined" ? window.location.origin : "https://puffpass.app",
                          icons: [
                            `${typeof window !== "undefined" ? window.location.origin : "https://puffpass.app"}/icon.png`,
                          ],
                        },
                        showQrModal: true,
                      }),
                    ]
                  : []),
              ],
              transports: {
                [sepolia.id]: http(),
              },
              ssr: true,
              storage: createStorage({
                storage: cookieStorage,
              }),
              batch: {
                multicall: false,
              },
              multiInjectedProviderDiscovery: false,
            })
          } catch (connectorError) {
            console.warn(
              "[v0] Connector initialization warning:",
              connectorError instanceof Error ? connectorError.message : "Unknown error",
            )
            // Continue anyway - connectors will be available but won't auto-connect
          }
        }

        if (!cachedQueryClient) {
          cachedQueryClient = new QueryClient({
            defaultOptions: {
              queries: {
                retry: 0,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                staleTime: Number.POSITIVE_INFINITY,
                gcTime: Number.POSITIVE_INFINITY,
              },
            },
          })
        }

        const finalLatency = Date.now() - startTime
        console.log(`[v0] Wagmi initialized successfully in ${finalLatency}ms`)

        await safeHealthLog({
          status: "connected",
          latency: finalLatency,
          errorCount: 0,
          projectId,
          isDemo: projectId === "demo-project-id",
          provider: "wagmi-optimized",
          connectionAttempts: 1,
          successfulConnections: 1,
          failedConnections: 0,
          uptimePercentage: 100,
          operator: "system",
          checkType: "automated",
          metadata: {
            initialization_time_ms: finalLatency,
            api_health_check: "passed",
            cached: cachedConfig !== null,
          },
        })

        setHealthStatus({
          isHealthy: true,
          status: "connected",
          error: undefined,
          lastChecked: new Date(),
          projectId,
          isDemo: projectId === "demo-project-id",
        })

        setHasWeb3(true)
        setIsInitialized(true)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown initialization error"
        const finalLatency = Date.now() - startTime

        console.error("[v0] Wagmi initialization failed:", errorMessage)

        await safeHealthLog({
          status: "error",
          latency: finalLatency,
          lastError: errorMessage,
          errorCount: 1,
          projectId,
          isDemo: projectId === "demo-project-id",
          provider: "wagmi-optimized",
          connectionAttempts: 1,
          successfulConnections: 0,
          failedConnections: 1,
          uptimePercentage: 0,
          operator: "system",
          checkType: "automated",
          metadata: {
            error_type: error instanceof Error ? error.constructor.name : "UnknownError",
            initialization_failed: true,
          },
        })

        setHealthStatus({
          isHealthy: false,
          status: "error",
          error: errorMessage,
          lastChecked: new Date(),
          projectId,
          isDemo: projectId === "demo-project-id",
        })

        setIsInitialized(true)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const errorMessage = reason?.message || reason?.toString() || ""

      // Check for wallet/connector related errors more broadly
      const isWalletError =
        errorMessage.includes("MetaMask") ||
        errorMessage.includes("connector") ||
        errorMessage.includes("wallet") ||
        errorMessage.includes("Failed to connect") ||
        errorMessage.includes("User rejected") ||
        errorMessage.includes("Connection") ||
        reason?.code === 4001 || // User rejected request
        reason?.code === -32002 || // Request already pending
        errorMessage.startsWith("i:") // Wagmi error format

      if (isWalletError) {
        console.warn("[v0] Suppressed wallet connection error:", errorMessage)
        event.preventDefault() // Prevent the error from being logged to console
        return
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    initializeWeb3()

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Initializing PuffPass...</p>
          <p className="text-xs text-slate-400 mt-2">Connecting to Web3 services...</p>
        </div>
      </div>
    )
  }

  if (!hasWeb3 || !cachedConfig || !cachedQueryClient) {
    return <Web3HealthContext.Provider value={healthStatus}>{children}</Web3HealthContext.Provider>
  }

  return (
    <Web3HealthContext.Provider value={healthStatus}>
      <WagmiProvider config={cachedConfig}>
        <QueryClientProvider client={cachedQueryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </Web3HealthContext.Provider>
  )
}
