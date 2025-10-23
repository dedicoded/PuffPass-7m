"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CybridTradeComponentProps {
  asset?: string
  fiat?: string
}

export function CybridTradeComponent({ asset = "BTC", fiat = "USD" }: CybridTradeComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && containerRef.current) {
      // Create Cybrid trade web component
      const tradeElement = document.createElement("cybrid-trade")
      tradeElement.setAttribute("asset", asset)
      tradeElement.setAttribute("fiat", fiat)

      // Clear container and append component
      containerRef.current.innerHTML = ""
      containerRef.current.appendChild(tradeElement)
    }
  }, [asset, fiat])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy Cryptocurrency</CardTitle>
        <CardDescription>Purchase crypto instantly with your payment method</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="min-h-[400px]" />
      </CardContent>
    </Card>
  )
}
