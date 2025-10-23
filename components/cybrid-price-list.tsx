"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CybridPriceList() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && containerRef.current) {
      // Create Cybrid price-list web component
      const priceListElement = document.createElement("cybrid-price-list")

      // Clear container and append component
      containerRef.current.innerHTML = ""
      containerRef.current.appendChild(priceListElement)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cryptocurrency Prices</CardTitle>
        <CardDescription>Real-time prices for popular cryptocurrencies</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="min-h-[300px]" />
      </CardContent>
    </Card>
  )
}
