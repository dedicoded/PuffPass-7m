"use client"

import type React from "react"
import { useEffect, useState } from "react"
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

        const response = await fetch("/api/cybrid/auth/token")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("[v0] Cybrid auth failed:", errorData)

          if (response.status === 401) {
            throw new Error(
              "Invalid Cybrid credentials. The credentials are either expired or incorrect.\n\n" +
                "To fix this:\n" +
                "1. Get valid sandbox credentials from Cybrid dashboard (https://app.cybrid.xyz)\n" +
                "2. Set CYBRID_CLIENT_ID and CYBRID_CLIENT_SECRET as server-side environment variables\n" +
                "3. Redeploy your application\n\n" +
                "Note: The fallback credentials in cybrid-config.ts are invalid.",
            )
          }

          if (errorData.error === "server_misconfig") {
            throw new Error(
              "Cybrid is not configured. Please set CYBRID_CLIENT_ID and CYBRID_CLIENT_SECRET as server-side environment variables in your deployment settings.",
            )
          }

          throw new Error(errorData.error_description || errorData.error || "Failed to authenticate with Cybrid")
        }

        const { token, bankGuid, environment } = await response.json()

        if (typeof window !== "undefined") {
          ;(window as any).cybridConfig = {
            bearer: token,
            environment: environment || "sandbox",
            bank: bankGuid,
          }

          console.log("[v0] Cybrid SDK initialized successfully")
          setIsInitialized(true)
        }
      } catch (err) {
        console.error("[v0] Failed to initialize Cybrid SDK:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
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
          <pre className="whitespace-pre-wrap text-sm mb-2">{error}</pre>
          <div className="text-sm mt-4 space-y-1 border-t pt-2">
            <p className="font-semibold">Quick Setup Guide:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to your deployment settings (e.g., Vercel Project Settings)</li>
              <li>Navigate to Environment Variables</li>
              <li>Add these server-side variables (do NOT use NEXT_PUBLIC_ prefix):</li>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>CYBRID_CLIENT_ID</li>
                <li>CYBRID_CLIENT_SECRET</li>
              </ul>
              <li>Redeploy your application</li>
            </ol>
          </div>
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
