import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label?: string }> = {
  // Order statuses
  pending: { variant: "secondary" },
  processing: { variant: "outline" },
  ready: { variant: "default" },
  completed: { variant: "default" },
  cancelled: { variant: "destructive" },

  // User statuses
  active: { variant: "default" },
  suspended: { variant: "destructive" },

  // Application statuses
  approved: { variant: "default" },
  rejected: { variant: "destructive" },

  // Compliance statuses
  compliant: { variant: "default" },
  warning: { variant: "secondary" },
  violation: { variant: "destructive" },

  // Stock statuses
  in_stock: { variant: "default", label: "In Stock" },
  low_stock: { variant: "secondary", label: "Low Stock" },
  out_of_stock: { variant: "destructive", label: "Out of Stock" },

  // Priority levels
  low: { variant: "outline" },
  medium: { variant: "secondary" },
  high: { variant: "destructive" },
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { variant: "outline" }
  const displayVariant = variant || config.variant
  const displayLabel = config.label || status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <Badge variant={displayVariant} className="capitalize">
      {displayLabel}
    </Badge>
  )
}
