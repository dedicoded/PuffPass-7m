"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Gift, Calendar, Package, Shirt, Zap, Check, Heart, Sparkles, TrendingUp, Clock } from "lucide-react"
import { toast } from "sonner"

interface EnhancedReward {
  reward_id: string
  name: string
  description: string
  category: string
  cost_points: number
  value_dollars: number
  image_url: string
  merchant: {
    id: string
    name: string
  }
  availability: {
    available: boolean
    remaining_count: number | null
  }
}

interface UserContext {
  current_points: number
  recent_redemptions: Array<{
    id: string
    points_spent: number
    redemption_code: string
    status: string
    redeemed_at: string
    reward_name: string
  }>
}

interface EnhancedRewardsCatalogProps {
  currentPoints: number
  onRedemption: () => void
}

export function EnhancedRewardsCatalog({ currentPoints, onRedemption }: EnhancedRewardsCatalogProps) {
  const [rewards, setRewards] = useState<EnhancedReward[]>([])
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [vaultMessage, setVaultMessage] = useState("")

  useEffect(() => {
    fetchEnhancedRewards()
  }, [])

  const fetchEnhancedRewards = async () => {
    try {
      const response = await fetch("/api/consumer/rewards/catalog")
      if (response.ok) {
        const data = await response.json()
        setRewards(data.available_rewards || [])
        setUserContext(data.user_context)
        setVaultMessage(data.vault_message || "")
      }
    } catch (error) {
      console.error("Failed to fetch enhanced rewards:", error)
      toast.error("Failed to load rewards catalog")
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId)
    try {
      const response = await fetch("/api/consumer/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          <div className="space-y-2">
            <p className="font-semibold">{data.message}</p>
            <p className="text-sm text-muted-foreground">Code: {data.redemptionCode}</p>
            <p className="text-sm">Points remaining: {data.pointsRemaining}</p>
          </div>,
        )
        fetchEnhancedRewards()
        onRedemption()
      } else {
        toast.error(data.error || "Failed to redeem reward")
      }
    } catch (error) {
      console.error("Redemption error:", error)
      toast.error("Failed to redeem reward. Please try again.")
    } finally {
      setRedeeming(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "discount":
        return <Zap className="w-5 h-5" />
      case "event":
        return <Calendar className="w-5 h-5" />
      case "product":
        return <Package className="w-5 h-5" />
      case "merch":
        return <Shirt className="w-5 h-5" />
      default:
        return <Gift className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "discount":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "event":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
      case "product":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      case "merch":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }

  const filteredRewards = rewards.filter((reward) => selectedCategory === "all" || reward.category === selectedCategory)

  const categories = ["all", "discount", "event", "product", "merch"]

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading enhanced rewards catalog...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Points Balance with Vault Context */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-chart-2/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Your Puff Points</h3>
              </div>
              <p className="text-3xl font-bold text-primary">{userContext?.current_points || currentPoints}</p>
              <p className="text-sm text-muted-foreground">
                Worth ${((userContext?.current_points || currentPoints) * 0.05).toFixed(2)} in rewards
              </p>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium">Vault Powered</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-48">{vaultMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      {userContext?.recent_redemptions && userContext.recent_redemptions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-primary" />
              Recent Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userContext.recent_redemptions.slice(0, 3).map((redemption) => (
                <div key={redemption.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{redemption.reward_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(redemption.redeemed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">-{redemption.points_spent} pts</p>
                    <Badge variant={redemption.status === "fulfilled" ? "default" : "secondary"} className="text-xs">
                      {redemption.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Category Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5 bg-card/50 border border-border/50">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="discount" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Discounts
          </TabsTrigger>
          <TabsTrigger value="event" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="product" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="merch" className="flex items-center gap-2">
            <Shirt className="w-4 h-4" />
            Merch
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => (
              <Card
                key={reward.reward_id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50"
              >
                <div className="aspect-video bg-muted relative">
                  <img
                    src={reward.image_url || "/placeholder.svg?height=200&width=300"}
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${getCategoryColor(reward.category)}`}>
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(reward.category)}
                      <span className="capitalize">{reward.category}</span>
                    </div>
                  </Badge>
                  {!reward.availability.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{reward.name}</CardTitle>
                    {reward.merchant.name && (
                      <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                        {reward.merchant.name}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">{reward.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="font-bold text-primary">{reward.cost_points} points</span>
                    </div>
                    {reward.value_dollars > 0 && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800"
                      >
                        ${reward.value_dollars} value
                      </Badge>
                    )}
                  </div>

                  {reward.availability.remaining_count !== null && (
                    <div className="text-sm text-muted-foreground">
                      {reward.availability.remaining_count > 0 ? (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{reward.availability.remaining_count} remaining</span>
                        </div>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Out of stock</span>
                      )}
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        disabled={
                          !reward.availability.available ||
                          (userContext?.current_points || currentPoints) < reward.cost_points
                        }
                      >
                        {(userContext?.current_points || currentPoints) < reward.cost_points ? (
                          <>Need {reward.cost_points - (userContext?.current_points || currentPoints)} more points</>
                        ) : !reward.availability.available ? (
                          "Unavailable"
                        ) : (
                          <>
                            <Gift className="w-4 h-4 mr-2" />
                            Redeem Now
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Confirm Redemption</DialogTitle>
                        <DialogDescription>Are you sure you want to redeem this reward?</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <h4 className="font-semibold">{reward.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                          {reward.merchant.name && (
                            <p className="text-sm text-primary mt-1">From: {reward.merchant.name}</p>
                          )}

                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm">Cost:</span>
                            <span className="font-bold text-primary">{reward.cost_points} points</span>
                          </div>

                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm">Your balance after:</span>
                            <span className="font-bold">
                              {(userContext?.current_points || currentPoints) - reward.cost_points} points
                            </span>
                          </div>

                          {reward.value_dollars > 0 && (
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm">Value:</span>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                ${reward.value_dollars}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1 bg-transparent">
                              Cancel
                            </Button>
                          </DialogTrigger>
                          <Button
                            onClick={() => handleRedeem(reward.reward_id)}
                            disabled={redeeming === reward.reward_id}
                            className="flex-1"
                          >
                            {redeeming === reward.reward_id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Redeeming...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Confirm Redemption
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredRewards.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No rewards available</h3>
          <p className="text-muted-foreground">Check back later for new merchant-sponsored rewards!</p>
        </div>
      )}
    </div>
  )
}
