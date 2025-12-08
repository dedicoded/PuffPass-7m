"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Web3Provider } from "@/components/web3-provider"

const NON_WEB3_PAGES = ["/", "/age-verification", "/login", "/register", "/privacy", "/terms", "/about"]

export function ConditionalWeb3Provider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  const needsWeb3 = !NON_WEB3_PAGES.some((page) => pathname.startsWith(page))

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!needsWeb3) {
      console.log("[v0] Skipping Web3Provider for route:", pathname)
    } else {
      console.log("[v0] Web3Provider needed for route:", pathname)
    }
  }, [pathname, needsWeb3])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!needsWeb3) {
    return <>{children}</>
  }

  return <Web3Provider>{children}</Web3Provider>
}
