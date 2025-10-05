"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

// Pages that don't need Web3 functionality
const NON_WEB3_PAGES = ["/age-verification", "/login", "/register", "/onboard", "/privacy", "/terms", "/about"]

export function ConditionalWeb3Provider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [Web3Provider, setWeb3Provider] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const needsWeb3 = !NON_WEB3_PAGES.some((page) => pathname.startsWith(page))

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = String(event.reason?.message || event.reason || "")

      // Suppress crypto polyfill and ESM loader errors
      if (errorMessage.includes("Unsupported Content-Type") && errorMessage.includes("crypto@1.0.1")) {
        console.warn("[v0] Suppressed crypto polyfill ESM loader error (expected in v0 environment)")
        event.preventDefault()
        setHasError(true)
        setIsLoading(false)
        return
      }

      // Suppress other Web3-related import errors
      if (errorMessage.includes("crypto") || errorMessage.includes("@stablelib") || errorMessage.includes("Web3")) {
        console.warn("[v0] Suppressed Web3-related error:", errorMessage)
        event.preventDefault()
        setHasError(true)
        setIsLoading(false)
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  useEffect(() => {
    if (needsWeb3 && !Web3Provider && !isLoading && !hasError) {
      setIsLoading(true)

      const loadTimeout = setTimeout(() => {
        console.warn("[v0] Web3Provider loading timeout - continuing without Web3")
        setHasError(true)
        setIsLoading(false)
      }, 2000)

      import("@/components/web3-provider")
        .then((module) => {
          clearTimeout(loadTimeout)
          console.log("[v0] Web3Provider loaded successfully")
          setWeb3Provider(() => module.Web3Provider)
          setIsLoading(false)
        })
        .catch((error) => {
          clearTimeout(loadTimeout)
          console.warn("[v0] Web3Provider failed to load - continuing without Web3:", error?.message || error)
          setHasError(true)
          setIsLoading(false)
        })
    }
  }, [needsWeb3, Web3Provider, isLoading, hasError])

  if (needsWeb3 && !hasError) {
    if (isLoading || !Web3Provider) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading Web3 services...</p>
            <p className="text-xs text-muted-foreground">This may take a moment</p>
          </div>
        </div>
      )
    }

    return <Web3Provider>{children}</Web3Provider>
  }

  return <>{children}</>
}
