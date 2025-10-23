"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cybridConfig } from "@/lib/cybrid-config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CybridProviderProps {
  children: React.ReactNode
}

export function CybridProvider({ children }: CybridProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeCybrid = async () => {
      try {
        console.log("[v0] Initializing Cybrid SDK...")

        // Get customer bearer token from API
        const response = await fetch("/api/cybrid/auth/token")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to get Cybrid auth token")
        }

        const { token } = await response.json()

        // Initialize Cybrid SDK with customer token
        if (typeof window !== "undefined" && window.customElements) {
          // Set global Cybrid configuration
          ;(window as any).cybridConfig = {
            bearer: token,
            environment: cybridConfig.environment,
            bank: cybridConfig.bankGuid,
          }

          console.log("[v0] Cybrid SDK initialized successfully")
          setIsInitialized(true)
        }
      } catch (err) {
        console.error("[v0] Failed to initialize Cybrid SDK:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    initializeCybrid()
  }, [])

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Cybrid Configuration Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">{error}</p>
          {error.includes("environment variables") && (
            <div className="text-sm mt-2 space-y-1">
              <p className="font-semibold">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to your Vercel project settings</li>
                <li>Navigate to Environment Variables</li>
                <li>Add CYBRID_CLIENT_SECRET with your Cybrid API secret</li>
                <li>Redeploy your application</li>
              </ol>
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
