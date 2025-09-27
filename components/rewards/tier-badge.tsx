import { Badge } from "@/components/ui/badge"
import { Crown, Award, Star, Gem } from "lucide-react"

interface TierBadgeProps {
  tier: "bronze" | "silver" | "gold" | "platinum"
  size?: "sm" | "md" | "lg"
}

const tierConfig = {
  bronze: {
    label: "Bronze",
    icon: Star,
    className: "tier-bronze",
    bgClass: "bg-[var(--tier-bronze)]",
  },
  silver: {
    label: "Silver",
    icon: Award,
    className: "tier-silver",
    bgClass: "bg-[var(--tier-silver)]",
  },
  gold: {
    label: "Gold",
    icon: Crown,
    className: "tier-gold",
    bgClass: "bg-[var(--tier-gold)]",
  },
  platinum: {
    label: "Platinum",
    icon: Gem,
    className: "tier-platinum",
    bgClass: "bg-[var(--tier-platinum)]",
  },
}

export function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const config = tierConfig[tier]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <Badge className={`${config.bgClass} text-background font-semibold ${sizeClasses[size]} flex items-center gap-1.5`}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  )
}
