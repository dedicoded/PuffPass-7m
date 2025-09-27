"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface DashboardHeaderProps {
  role: "customer" | "merchant" | "admin"
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  onLogout?: () => void
}

const roleConfig = {
  customer: {
    title: "Customer Dashboard",
    icon: "🛒",
    color: "bg-green-500/10 text-green-700",
  },
  merchant: {
    title: "Merchant Dashboard",
    icon: "🏪",
    color: "bg-blue-500/10 text-blue-700",
  },
  admin: {
    title: "Platform Admin",
    icon: "🛡️",
    color: "bg-purple-500/10 text-purple-700",
  },
}

export function DashboardHeader({ role, title, subtitle, actions, onLogout }: DashboardHeaderProps) {
  const config = roleConfig[role]

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/"
    }
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">🍃 MyCora</h1>
            <Badge variant="secondary" className={config.color}>
              {title || config.title}
            </Badge>
            {subtitle && <span className="text-sm text-muted-foreground">• {subtitle}</span>}
          </div>

          <div className="flex items-center space-x-4">
            {actions}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
