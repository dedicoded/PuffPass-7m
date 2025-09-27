import type { ReactNode } from "react"

interface DashboardLayoutProps {
  header: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardLayout({ header, children, className }: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className || ""}`}>
      {header}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
