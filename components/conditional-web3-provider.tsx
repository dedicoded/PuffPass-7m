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
    if (needsWeb3 && !Web3Provider && !isLoading && !hasError) {
      setIsLoading(true)

      const loadTimeout = setTimeout(() => {
        console.warn("[v0] Web3Provider loading timeout - continuing without Web3")
        setHasError(true)
        setIsLoading(false)
      }, 3000)

      import("@/components/web3-provider")
        .then((module) => {
          clearTimeout(loadTimeout)
          setWeb3Provider(() => module.Web3Provider)
          setIsLoading(false)
        })
        .catch((error) => {
          clearTimeout(loadTimeout)
          console.warn("[v0] Web3Provider failed to load - continuing without Web3:", error.message)
          setHasError(true)
          setIsLoading(false)
        })
    }
  }, [needsWeb3, Web3Provider, isLoading, hasError])

  if (!needsWeb3 || hasError) {
    return <>{children}</>
  }

  if (isLoading || !Web3Provider) {
    return <>{children}</>
  }

  return <Web3Provider>{children}</Web3Provider>
}
