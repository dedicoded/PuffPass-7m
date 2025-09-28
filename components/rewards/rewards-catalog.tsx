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
import { Gift, Calendar, Package, Shirt, Zap, Check } from "lucide-react"

interface Reward {
  id: string
  name: string
  description: string
  category: string
  points_cost: number
  value_dollars: number
  image_url: string
  availability_count: number | null
  available: boolean
}

interface RewardsCatalogProps {
  currentPoints: number
  onRedemption: () => void
}

export function RewardsCatalog({ currentPoints, onRedemption }: RewardsCatalogProps) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [redeeming, setRedeeming] = useState<string | null>(null)

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {
      const response = await fetch("/api/rewards/catalog")
      if (response.ok) {
        const data = await response.json()
        setRewards(data.rewards || [])
      }
    } catch (error) {
      console.error("Failed to fetch rewards:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId)
    try {
      const response = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`${data.message}\nRedemption Code: ${data.redemptionCode}`)
        fetchRewards()
        onRedemption()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to redeem reward")
      }
    } catch (error) {
      console.error("Redemption error:", error)
      alert("Failed to redeem reward. Please try again.")
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
        return "bg-green-100 text-green-800 border-green-200"
      case "event":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "product":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "merch":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredRewards = rewards.filter((reward) => selectedCategory === "all" || reward.category === selectedCategory)

  const categories = ["all", "discount", "event", "product", "merch"]

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading rewards...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <Card className="bg-gradient-to-r from-primary/10 to-chart-2/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Your Puff Points</h3>
              <p className="text-3xl font-bold text-primary">{currentPoints}</p>
            </div>
            <div className="text-right">
              <Gift className="w-12 h-12 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Ready to redeem!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Rewards</TabsTrigger>
          <TabsTrigger value="discount">Discounts</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
          <TabsTrigger value="product">Products</TabsTrigger>
          <TabsTrigger value="merch">Merch</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={reward.image_url || "/placeholder.svg"}
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${getCategoryColor(reward.category)}`}>
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(reward.category)}
                      <span className="capitalize">{reward.category}</span>
                    </div>
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{reward.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{reward.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="font-bold text-primary">{reward.points_cost} points</span>
                    </div>
                    {reward.value_dollars > 0 && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        ${reward.value_dollars} value
                      </Badge>
                    )}
                  </div>

                  {reward.availability_count !== null && (
                    <div className="text-sm text-muted-foreground">
                      {reward.availability_count > 0 ? (
                        <span>{reward.availability_count} remaining</span>
                      ) : (
                        <span className="text-red-600">Out of stock</span>
                      )}
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" disabled={!reward.available || currentPoints < reward.points_cost}>
                        {currentPoints < reward.points_cost ? (
                          <>Need {reward.points_cost - currentPoints} more points</>
                        ) : !reward.available ? (
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
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold">{reward.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>

                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm">Cost:</span>
                            <span className="font-bold text-primary">{reward.points_cost} points</span>
                          </div>

                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm">Your balance after:</span>
                            <span className="font-bold">{currentPoints - reward.points_cost} points</span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1 bg-transparent">
                              Cancel
                            </Button>
                          </DialogTrigger>
                          <Button
                            onClick={() => handleRedeem(reward.id)}
                            disabled={redeeming === reward.id}
                            className="flex-1"
                          >
                            {redeeming === reward.id ? (
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
          <p className="text-muted-foreground">Check back later for new rewards!</p>
        </div>
      )}
    </div>
  )
}
