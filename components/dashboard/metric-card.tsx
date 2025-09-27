import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
  }
  format?: "currency" | "percentage" | "number"
  className?: string
}

export function MetricCard({ title, value, change, format = "number", className }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === "currency") {
      return typeof val === "number" ? `$${val.toFixed(2)}` : val
    }
    if (format === "percentage") {
      return typeof val === "number" ? `${val}%` : val
    }
    return val
  }

  const getTrendIcon = () => {
    if (!change) return null
    if (change.value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (change.value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground"
    if (change.value > 0) return "text-green-600"
    if (change.value < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {change && (
            <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>
                {Math.abs(change.value)}% {change.period}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
