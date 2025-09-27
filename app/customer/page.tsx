"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Star,
  Search,
  MapPin,
  Gift,
  CreditCard,
  Package,
  LogOut,
  Plus,
  Minus,
  Trophy,
  Target,
  Zap,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  User,
} from "lucide-react"
import { TierProgress } from "@/components/rewards/tier-progress"
import { TierBadge } from "@/components/rewards/tier-badge"
import { AchievementCard } from "@/components/rewards/achievement-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { WalletDashboard } from "@/components/wallet-dashboard"

interface Product {
  id: string
  name: string
  category: string
  price: number
  thc_content: number
  cbd_content: number
  description: string
  image_url: string
  merchant_name: string
  rating: number
  in_stock: boolean
}

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  items: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}

interface Transaction {
  id: string
  type: "purchase" | "onramp" | "reward" | "refund"
  amount: number
  puff_amount?: number
  description: string
  created_at: string
  status: "completed" | "pending" | "failed"
}

export default function CustomerDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [puffPoints, setPuffPoints] = useState(0)
  const [puffBalance, setPuffBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rewardsData, setRewardsData] = useState({
    currentTier: "bronze" as const,
    totalSpent: 245,
    achievements: [
      {
        id: "first-purchase",
        title: "First Purchase",
        description: "Complete your first cannabis purchase",
        icon: "🛒",
        points: 50,
        unlocked: true,
      },
      {
        id: "early-adopter",
        title: "Early Adopter",
        description: "Join MyCora in the first month",
        icon: "🌟",
        points: 100,
        unlocked: true,
      },
      {
        id: "loyal-customer",
        title: "Loyal Customer",
        description: "Make 10 purchases",
        icon: "💎",
        points: 200,
        unlocked: false,
        progress: 3,
        maxProgress: 10,
      },
      {
        id: "big-spender",
        title: "Big Spender",
        description: "Spend $500 in total",
        icon: "💰",
        points: 300,
        unlocked: false,
        progress: 245,
        maxProgress: 500,
      },
      {
        id: "reviewer",
        title: "Product Reviewer",
        description: "Leave 5 product reviews",
        icon: "⭐",
        points: 150,
        unlocked: false,
        progress: 1,
        maxProgress: 5,
      },
      {
        id: "referral-master",
        title: "Referral Master",
        description: "Refer 3 friends to MyCora",
        icon: "🤝",
        points: 500,
        unlocked: false,
        progress: 0,
        maxProgress: 3,
      },
    ],
  })

  useEffect(() => {
    fetchProducts()
    fetchOrders()
    fetchPuffPoints()
    fetchPuffBalance()
    fetchTransactions()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPuffPoints = async () => {
    try {
      const response = await fetch("/api/puff-points")
      if (response.ok) {
        const data = await response.json()
        setPuffPoints(data.points || 0)
      }
    } catch (error) {
      console.error("Failed to fetch puff points:", error)
    }
  }

  const fetchPuffBalance = async () => {
    try {
      const response = await fetch("/api/puff-balance")
      if (response.ok) {
        const data = await response.json()
        setPuffBalance(data.balance || 0)
      }
    } catch (error) {
      console.error("Failed to fetch puff balance:", error)
      // Mock data for demo
      setPuffBalance(127.45)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
      // Mock data for demo
      setTransactions([
        {
          id: "1",
          type: "onramp",
          amount: 100,
          puff_amount: 95.24,
          description: "Added funds via Apple Pay",
          created_at: "2024-01-15T10:30:00Z",
          status: "completed",
        },
        {
          id: "2",
          type: "purchase",
          amount: 45.99,
          puff_amount: -45.99,
          description: "Purchase at Green Valley Dispensary",
          created_at: "2024-01-14T15:45:00Z",
          status: "completed",
        },
        {
          id: "3",
          type: "reward",
          amount: 0,
          puff_amount: 5.0,
          description: "Achievement bonus: First Purchase",
          created_at: "2024-01-14T15:46:00Z",
          status: "completed",
        },
        {
          id: "4",
          type: "onramp",
          amount: 50,
          puff_amount: 47.62,
          description: "Added funds via Cash App",
          created_at: "2024-01-12T09:15:00Z",
          status: "completed",
        },
      ])
    }
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateCartQuantity = (productId: string, change: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = Math.max(0, item.quantity + change)
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean) as Array<{ product: Product; quantity: number }>
    })
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">🍃 PuffPass</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Customer Dashboard
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-accent/50 px-3 py-2 rounded-lg border border-border/50">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="font-medium text-accent-foreground">{puffBalance.toFixed(2)} PUFF</span>
                </div>
                <div className="flex items-center space-x-2 bg-accent/50 px-3 py-2 rounded-lg border border-border/50">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="font-medium text-accent-foreground">{puffPoints} Points</span>
                </div>
              </div>

              <TierBadge tier={rewardsData.currentTier} />

              <div className="relative">
                <Button variant="outline" size="sm" className="relative bg-transparent border-border/50">
                  <ShoppingCart className="w-4 h-4" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-card/50 border border-border/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="browse">Browse Products</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="cart">Cart ({cartItemCount})</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">PUFF Balance</p>
                      <p className="text-2xl font-bold text-foreground">{puffBalance.toFixed(2)}</p>
                    </div>
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Puff Points</p>
                      <p className="text-2xl font-bold text-foreground">{puffPoints}</p>
                    </div>
                    <Gift className="w-8 h-8 text-[var(--chart-2)]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold text-foreground">${rewardsData.totalSpent}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-[var(--chart-3)]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-[var(--chart-4)]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account and funds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-16 flex-col space-y-2" asChild>
                    <a href="/onramp">
                      <Plus className="w-6 h-6" />
                      <span>Add Funds</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col space-y-2 bg-transparent" asChild>
                    <a href="#browse">
                      <ShoppingCart className="w-6 h-6" />
                      <span>Shop Products</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col space-y-2 bg-transparent" asChild>
                    <a href="#rewards">
                      <Trophy className="w-6 h-6" />
                      <span>View Rewards</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest PUFF activity</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "onramp"
                              ? "bg-green-100 text-green-600"
                              : transaction.type === "purchase"
                                ? "bg-blue-100 text-blue-600"
                                : transaction.type === "reward"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {transaction.type === "onramp" ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : transaction.type === "purchase" ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : transaction.type === "reward" ? (
                            <Gift className="w-5 h-5" />
                          ) : (
                            <DollarSign className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.puff_amount && transaction.puff_amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.puff_amount && transaction.puff_amount > 0 ? "+" : ""}
                          {transaction.puff_amount?.toFixed(2)} PUFF
                        </p>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browse Products Tab */}
          <TabsContent value="browse" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search cannabis products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={
                        product.image_url ||
                        `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {product.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-primary">${product.price}</div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>THC: {product.thc_content}%</span>
                      <span>CBD: {product.cbd_content}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{product.merchant_name}</span>
                      </div>
                    </div>

                    <Button onClick={() => addToCart(product)} disabled={!product.in_stock} className="w-full">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cart Tab */}
          <TabsContent value="cart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>Review your items before checkout</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={
                              item.product.image_url ||
                              `/placeholder.svg?height=60&width=60&query=${encodeURIComponent(item.product.name) || "/placeholder.svg"}`
                            }
                            alt={item.product.name}
                            className="w-15 h-15 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">${item.product.price} each</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button variant="outline" size="sm" onClick={() => updateCartQuantity(item.product.id, -1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="sm" onClick={() => updateCartQuantity(item.product.id, 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                          <div className="w-20 text-right font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total: ${cartTotal.toFixed(2)}</span>
                        <Button size="lg">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Checkout
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Track your past purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">Order #{order.id.slice(-8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                              {order.status}
                            </Badge>
                            <p className="font-bold mt-1">${order.total_amount}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {item.quantity}x {item.product_name}
                              </span>
                              <span>${item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tier Progress */}
              <div className="lg:col-span-1">
                <TierProgress
                  currentTier={rewardsData.currentTier}
                  currentPoints={puffPoints}
                  nextTierPoints={500}
                  totalSpent={rewardsData.totalSpent}
                />
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {rewardsData.achievements.filter((a) => a.unlocked).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 text-[var(--chart-2)] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">${rewardsData.totalSpent}</div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-8 h-8 text-[var(--chart-3)] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {rewardsData.achievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Bonus Points</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Achievements Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Achievements
                </CardTitle>
                <CardDescription>Unlock achievements to earn bonus Puff Points and exclusive rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewardsData.achievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tier Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Tier Benefits</CardTitle>
                <CardDescription>Unlock exclusive perks as you progress through tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-[var(--tier-bronze)]/10 border border-[var(--tier-bronze)]/20">
                    <TierBadge tier="bronze" size="sm" />
                    <h4 className="font-semibold mt-2 mb-2">Bronze Benefits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 1x points on purchases</li>
                      <li>• Basic customer support</li>
                      <li>• Standard delivery</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--tier-silver)]/10 border border-[var(--tier-silver)]/20">
                    <TierBadge tier="silver" size="sm" />
                    <h4 className="font-semibold mt-2 mb-2">Silver Benefits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 1.25x points on purchases</li>
                      <li>• Priority customer support</li>
                      <li>• Free delivery over $50</li>
                      <li>• Early access to new products</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--tier-gold)]/10 border border-[var(--tier-gold)]/20">
                    <TierBadge tier="gold" size="sm" />
                    <h4 className="font-semibold mt-2 mb-2">Gold Benefits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 1.5x points on purchases</li>
                      <li>• VIP customer support</li>
                      <li>• Free delivery on all orders</li>
                      <li>• Exclusive product access</li>
                      <li>• Monthly bonus points</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--tier-platinum)]/10 border border-[var(--tier-platinum)]/20">
                    <TierBadge tier="platinum" size="sm" />
                    <h4 className="font-semibold mt-2 mb-2">Platinum Benefits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 2x points on purchases</li>
                      <li>• Dedicated account manager</li>
                      <li>• Free same-day delivery</li>
                      <li>• Private product launches</li>
                      <li>• Quarterly bonus rewards</li>
                      <li>• Exclusive events access</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <WalletDashboard userId="current-user" />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/diverse-user-avatars.png" />
                      <AvatarFallback className="bg-primary/10">
                        <User className="w-8 h-8 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Cannabis Customer</h3>
                      <p className="text-sm text-muted-foreground">Member since 2024</p>
                      <TierBadge tier={rewardsData.currentTier} size="sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input value="customer@example.com" disabled className="bg-muted/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input placeholder="Add phone number" className="bg-background/50" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Puff Points Summary
                  </CardTitle>
                  <CardDescription>Your rewards at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{puffPoints}</div>
                    <p className="text-sm text-muted-foreground">Available Points</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Next Reward</span>
                      <span className="font-medium">500 points</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((puffPoints / 500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Earn points with every purchase and unlock achievements for bonus rewards.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
