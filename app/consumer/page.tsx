"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Coins, Star, Gift, TrendingUp, ArrowRight, Leaf, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConsumerBalance {
  total_points: number
  value_estimate: number
  current_tier: string
  next_tier: string
  points_to_next_tier: number
  transaction_count: number
}

interface Reward {
  id: string
  name: string
  description: string
  points_cost: number
  value_dollars: number
  merchant_name: string
  category: string
  image_url?: string
  availability_count: number
}

interface Activity {
  points: number
  type: string
  description: string
  merchant_name?: string
  created_at: string
  display_text: string
}

export default function ConsumerApp() {
  const [balance, setBalance] = useState<ConsumerBalance | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Mock user ID - in real app this would come from auth
  const userId = "user123"

  useEffect(() => {
    fetchConsumerData()
  }, [])

  const fetchConsumerData = async () => {
    try {
      const [balanceRes, rewardsRes, activityRes] = await Promise.all([
        fetch(`/api/consumer/balance?userId=${userId}`),
        fetch("/api/consumer/rewards"),
        fetch(`/api/consumer/activity?userId=${userId}`),
      ])

      const [balanceData, rewardsData, activityData] = await Promise.all([
        balanceRes.json(),
        rewardsRes.json(),
        activityRes.json(),
      ])

      setBalance(balanceData)
      setRewards(rewardsData)
      setActivity(activityData)
    } catch (error) {
      console.error("[v0] Failed to fetch consumer data:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["all", ...new Set(rewards.map((r) => r.category))]
  const filteredRewards = selectedCategory === "all" ? rewards : rewards.filter((r) => r.category === selectedCategory)

  const tierProgress = balance
    ? balance.points_to_next_tier > 0
      ? ((balance.total_points % 500) / 500) * 100
      : 100
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 friendly-gradient rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading your Puff Pass...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/puff-pass-logo.png" alt="Puff Pass" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold">Puff Pass</h1>
                <p className="text-sm text-muted-foreground">Consumer App</p>
              </div>
            </div>
            <Badge variant="secondary" className="trust-badge">
              <Star className="w-4 h-4 mr-1" />
              {balance?.current_tier}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <Card className="friendly-gradient smile-shadow border-0 text-primary-foreground">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Puff Points Balance</div>
                    <div className="text-3xl font-bold">{balance?.total_points || 0}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Value Estimate</div>
                  <div className="text-2xl font-bold">${balance?.value_estimate || 0}</div>
                </div>
              </div>

              {balance && balance.points_to_next_tier > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm opacity-90">
                    <span>{balance.current_tier}</span>
                    <span>{balance.next_tier}</span>
                  </div>
                  <Progress value={tierProgress} className="h-2 bg-primary-foreground/20" />
                  <p className="text-sm opacity-90 text-center">
                    {balance.points_to_next_tier} points until {balance.next_tier}
                  </p>
                </div>
              )}

              <Button
                variant="secondary"
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Top Up Now - Earn Bonus Points <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards">Rewards Catalog</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          </TabsList>

          {/* Rewards Catalog */}
          <TabsContent value="rewards" className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category === "all" ? "All Rewards" : category}
                </Button>
              ))}
            </div>

            {/* Rewards Grid */}
            <div className="grid gap-4">
              {filteredRewards.map((reward) => (
                <Card key={reward.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 friendly-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                        <Gift className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{reward.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {reward.merchant_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{reward.points_cost}</div>
                            <div className="text-xs text-muted-foreground">points</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            ${reward.value_dollars} value
                          </Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {reward.availability_count} available
                          </div>
                        </div>
                        <Button
                          className="w-full mt-3"
                          disabled={!balance || balance.total_points < reward.points_cost}
                        >
                          {balance && balance.total_points >= reward.points_cost
                            ? "Redeem Now"
                            : `Need ${reward.points_cost - (balance?.total_points || 0)} more points`}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRewards.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No rewards available</h3>
                  <p className="text-muted-foreground">Check back soon for new rewards from merchants!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity Feed */}
          <TabsContent value="activity" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Badge variant="outline">{activity.length} transactions</Badge>
            </div>

            <div className="space-y-3">
              {activity.map((item, index) => (
                <Card key={index} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          item.points > 0 ? "bg-success/20 text-success" : "bg-primary/20 text-primary",
                        )}
                      >
                        {item.points > 0 ? <TrendingUp className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.display_text}</p>
                        {item.merchant_name && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.merchant_name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className={cn("text-right font-bold", item.points > 0 ? "text-success" : "text-primary")}>
                        {item.points > 0 ? "+" : ""}
                        {item.points}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activity.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                  <p className="text-muted-foreground">Start earning Puff Points by making purchases!</p>
                  <Button className="mt-4">
                    Find Merchants <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Impact Note */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Leaf className="w-5 h-5 text-primary" />
              <p className="text-sm text-primary">
                <strong>Powered by the Puff Vault:</strong> Your rewards are funded by merchant fees, creating a
                sustainable ecosystem that benefits everyone.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
