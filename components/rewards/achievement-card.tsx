import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Lock } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface AchievementCardProps {
  achievement: Achievement
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const progressPercentage = achievement.maxProgress ? ((achievement.progress || 0) / achievement.maxProgress) * 100 : 0

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:scale-105 ${
        achievement.unlocked ? "achievement-glow border-primary/50" : "opacity-60"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="text-2xl">{achievement.icon}</div>
          {achievement.unlocked ? (
            <CheckCircle className="w-5 h-5 text-primary" />
          ) : (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{achievement.description}</p>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            +{achievement.points} pts
          </Badge>

          {achievement.maxProgress && !achievement.unlocked && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-16 bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span>
                {achievement.progress}/{achievement.maxProgress}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
