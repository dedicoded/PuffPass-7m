"use client"

import type React from "react"
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

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasWeb3, setHasWeb3] = useState(false)
  const [Web3Components, setWeb3Components] = useState<any>(null)
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
        console.log("[v0] Initializing wagmi with native connectors...")

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

        const [wagmi, tanstackQuery, wagmiChains, wagmiConnectors] = await Promise.all([
          import("wagmi").catch((err) => {
            console.error("[v0] Failed to import wagmi:", err)
            return null
          }),
          import("@tanstack/react-query").catch((err) => {
            console.error("[v0] Failed to import react-query:", err)
            return null
          }),
          import("wagmi/chains").catch((err) => {
            console.error("[v0] Failed to import wagmi chains:", err)
            return null
          }),
          import("wagmi/connectors").catch((err) => {
            console.error("[v0] Failed to import wagmi connectors:", err)
            return null
          }),
        ])

        if (!wagmi || !tanstackQuery || !wagmiChains || !wagmiConnectors) {
          console.warn("[v0] Web3 dependencies failed to load - continuing without Web3")
          setHealthStatus({
            isHealthy: false,
            status: "unavailable",
            error: "Web3 dependencies failed to load",
            lastChecked: new Date(),
            projectId,
            isDemo: projectId === "demo-project-id",
          })
          setIsInitialized(true)
          return
        }

        const { WagmiProvider, http, createConfig, cookieStorage, createStorage } = wagmi
        const { QueryClient, QueryClientProvider } = tanstackQuery
        const { mainnet, polygon, sepolia } = wagmiChains
        const { injected, walletConnect } = wagmiConnectors

        const config = createConfig({
          chains: [mainnet, polygon, sepolia],
          connectors: [
            injected(),
            // Only add WalletConnect if we have a real project ID
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
                  }),
                ]
              : []),
          ],
          transports: {
            [mainnet.id]: http(),
            [polygon.id]: http(),
            [sepolia.id]: http(),
          },
          ssr: true,
          storage: createStorage({
            storage: cookieStorage,
          }),
        })

        const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              retry: 1,
              refetchOnWindowFocus: false,
            },
          },
        })

        const finalLatency = Date.now() - startTime
        console.log(`[v0] Wagmi initialized successfully in ${finalLatency}ms`)

        await safeHealthLog({
          status: "connected",
          latency: finalLatency,
          errorCount: 0,
          projectId,
          isDemo: projectId === "demo-project-id",
          provider: "wagmi-native",
          connectionAttempts: 1,
          successfulConnections: 1,
          failedConnections: 0,
          uptimePercentage: 100,
          operator: "system",
          checkType: "automated",
          metadata: {
            initialization_time_ms: finalLatency,
            api_health_check: "passed",
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

        setWeb3Components({
          WagmiProvider,
          QueryClientProvider,
          config,
          queryClient,
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
          provider: "wagmi-native",
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

    initializeWeb3()
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

  if (!hasWeb3 || !Web3Components) {
    return <Web3HealthContext.Provider value={healthStatus}>{children}</Web3HealthContext.Provider>
  }

  const { WagmiProvider, QueryClientProvider, config, queryClient } = Web3Components

  return (
    <Web3HealthContext.Provider value={healthStatus}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </Web3HealthContext.Provider>
  )
}
