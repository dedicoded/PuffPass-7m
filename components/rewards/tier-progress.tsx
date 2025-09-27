import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TierBadge } from "./tier-badge"

interface TierProgressProps {
  currentTier: "bronze" | "silver" | "gold" | "platinum"
  currentPoints: number
  nextTierPoints: number
  totalSpent: number
}

const tierThresholds = {
  bronze: { min: 0, max: 500, next: "silver" as const },
  silver: { min: 500, max: 1500, next: "gold" as const },
  gold: { min: 1500, max: 5000, next: "platinum" as const },
  platinum: { min: 5000, max: Number.POSITIVE_INFINITY, next: null },
}

export function TierProgress({ currentTier, currentPoints, nextTierPoints, totalSpent }: TierProgressProps) {
  const tierInfo = tierThresholds[currentTier]
  const progressToNext = tierInfo.next ? ((totalSpent - tierInfo.min) / (tierInfo.max - tierInfo.min)) * 100 : 100

  const pointsToNext = tierInfo.next ? tierInfo.max - totalSpent : 0

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tier Status</CardTitle>
          <TierBadge tier={currentTier} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{currentPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Puff Points</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
        </div>

        {tierInfo.next && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {tierInfo.next}</span>
              <span className="font-medium">${pointsToNext.toLocaleString()} to go</span>
            </div>
            <Progress value={Math.min(progressToNext, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${tierInfo.min.toLocaleString()}</span>
              <span>${tierInfo.max.toLocaleString()}</span>
            </div>
          </div>
        )}

        {currentTier === "platinum" && (
          <div className="text-center py-2">
            <p className="text-sm font-medium text-primary">🎉 Maximum Tier Achieved!</p>
            <p className="text-xs text-muted-foreground">You're in the elite Platinum tier</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
