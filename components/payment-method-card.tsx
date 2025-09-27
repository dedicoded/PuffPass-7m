"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Shield } from "lucide-react"

interface PaymentMethodCardProps {
  method: {
    id: string
    name: string
    icon: React.ReactNode
    description: string
    processingTime: string
    fees: string
    limits: string
    popular?: boolean
  }
  onClick: () => void
}

export function PaymentMethodCard({ method, onClick }: PaymentMethodCardProps) {
  return (
    <Card className="card-hover cursor-pointer relative" onClick={onClick}>
      {method.popular && <Badge className="absolute -top-2 -right-2 bg-orange-500">Popular</Badge>}
      <CardHeader>
        <div className="flex items-center space-x-3">
          {method.icon}
          <div>
            <CardTitle className="text-lg">{method.name}</CardTitle>
            <CardDescription>{method.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Time</span>
            </div>
            <p className="font-medium">{method.processingTime}</p>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              <span>Fee</span>
            </div>
            <p className="font-medium">{method.fees}</p>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Limits</span>
            </div>
            <p className="font-medium text-xs">{method.limits}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
