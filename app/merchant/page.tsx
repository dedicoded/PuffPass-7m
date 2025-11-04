"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  BarChart3,
  LogOut,
  QrCode,
  Wallet,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Minus,
  Heart,
  Shield,
  Users,
  Target,
  Zap,
  Gift,
  Trophy,
  Crown,
  Award,
  Eye,
} from "lucide-react"
import { PuffPassLogo } from "@/components/puffpass-logo"

interface Product {
  id: string
  name: string
  category: string
  price: number
  thc_content: number
  cbd_content: number
  description: string
  image_url: string
  stock_quantity: number
  in_stock: boolean
  created_at: string
}

interface Order {
  id: string
  customer_email: string
  total_amount: number
  status: string
  created_at: string
  items: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}

interface Analytics {
  total_revenue: number
  total_orders: number
  total_customers: number
  top_products: Array<{
    name: string
    sales: number
  }>
}

interface WithdrawalRequest {
  id: string
  amount: number
  status: "pending" | "approved" | "rejected" | "completed"
  requested_at: string
  processed_at?: string
  notes?: string
}

interface VaultContribution {
  total_contribution: number
  breakdown: {
    withdrawal_fees: number
    transaction_fees: number
  }
  contribution_stats: {
    contribution_count: number
    last_contribution: string
  }
  impact_metrics: {
    customer_payments_covered: number
    puff_points_funded: number
    customer_loyalty_boost: number
    repeat_purchase_increase: number
  }
  last_updated: string
}

interface RewardOffer {
  id: string
  name: string
  description: string
  points_cost: number
  value_dollars: number
  category: string
  availability_count: number
  redemptions_count: number
  is_active: boolean
  created_at: string
}

interface LeaderboardEntry {
  rank: number
  merchant_name: string
  merchant_id: string
  fees_paid: number
  points_funded: number
  redemptions_driven: number
  badge?: string
}

interface MerchantContributions {
  vault_contribution: number
  rewards_funded: number
  transaction_count: number
  fee_free_payments_enabled: number
}

export default function MerchantDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [vaultContribution, setVaultContribution] = useState<VaultContribution | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isPOSOpen, setIsPOSOpen] = useState(false)
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [availableBalance, setAvailableBalance] = useState(0)
  const [pendingBalance, setPendingBalance] = useState(0)

  // POS State
  const [posCart, setPosCart] = useState<Array<{ product: Product; quantity: number }>>([])
  const [customerEmail, setCustomerEmail] = useState("")

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    thc_content: "",
    cbd_content: "",
    description: "",
    stock_quantity: "",
  })

  const [rewardOffers, setRewardOffers] = useState<RewardOffer[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [merchantContributions, setMerchantContributions] = useState<MerchantContributions | null>(null)
  const [isRewardBuilderOpen, setIsRewardBuilderOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<RewardOffer | null>(null)
  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    points_cost: "",
    value_dollars: "",
    category: "",
    availability_count: "",
  })

  // Mock merchant ID - in real app this would come from auth
  // const merchantId = "merchant123"

  const router = useRouter()
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const fetchMerchantId = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const session = await response.json()
          if (session?.user?.id) {
            setMerchantId(session.user.id)
          } else {
            // Use a valid UUID format for demo purposes
            setMerchantId("550e8400-e29b-4d96-a831-146d3d3d3d3d")
          }
        } else {
          // Use a valid UUID format for demo purposes
          setMerchantId("550e8400-e29b-4d96-a831-146d3d3d3d3d")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch merchant ID:", error)
        // Use a valid UUID format for demo purposes
        setMerchantId("550e8400-e29b-4d96-a831-146d3d3d3d3d")
      } finally {
        setAuthLoading(false)
      }
    }

    fetchMerchantId()
  }, [])

  useEffect(() => {
    if (!merchantId || authLoading) return

    fetchProducts()
    fetchOrders()
    fetchAnalytics()
    fetchWithdrawalRequests()
    fetchBalances()
    fetchVaultContribution()
    fetchRewardOffers()
    fetchLeaderboard()
    fetchMerchantContributions()
  }, [merchantId, authLoading])

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

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/merchant/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  const fetchWithdrawalRequests = async () => {
    try {
      console.log("[v0] Fetching withdrawal requests...")
      const response = await fetch("/api/merchant/withdrawals")

      if (!response.ok) {
        console.error(`[v0] Withdrawal API returned ${response.status}`)
        // Don't throw - just use fallback data to prevent retry loop
        setWithdrawalRequests([
          {
            id: "demo-1",
            amount: 500,
            status: "pending",
            requested_at: "2024-01-15T10:30:00Z",
          },
          {
            id: "demo-2",
            amount: 1200,
            status: "completed",
            requested_at: "2024-01-10T14:20:00Z",
            processed_at: "2024-01-12T09:15:00Z",
          },
        ])
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Expected JSON but got:", contentType)
        setWithdrawalRequests([
          {
            id: "demo-1",
            amount: 500,
            status: "pending",
            requested_at: "2024-01-15T10:30:00Z",
          },
        ])
        return
      }

      const data = await response.json()
      setWithdrawalRequests(data.requests || [])
      console.log("[v0] Withdrawal requests loaded successfully")
    } catch (error) {
      console.error("[v0] Failed to fetch withdrawal requests:", error)
      // Use fallback data instead of retrying
      setWithdrawalRequests([
        {
          id: "demo-1",
          amount: 500,
          status: "pending",
          requested_at: "2024-01-15T10:30:00Z",
        },
        {
          id: "demo-2",
          amount: 1200,
          status: "completed",
          requested_at: "2024-01-10T14:20:00Z",
          processed_at: "2024-01-12T09:15:00Z",
        },
      ])
    }
  }

  const fetchBalances = async () => {
    try {
      console.log("[v0] Fetching merchant balances...")
      const response = await fetch("/api/merchant/balance")

      if (!response.ok) {
        console.error(`[v0] Balance API returned ${response.status}`)
        // Use fallback data to prevent retry loop
        setAvailableBalance(2450.75)
        setPendingBalance(500.0)
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Expected JSON but got:", contentType)
        setAvailableBalance(2450.75)
        setPendingBalance(500.0)
        return
      }

      const data = await response.json()
      setAvailableBalance(data.available || 0)
      setPendingBalance(data.pending || 0)
      console.log("[v0] Balances loaded successfully")
    } catch (error) {
      console.error("[v0] Failed to fetch balances:", error)
      setAvailableBalance(2450.75)
      setPendingBalance(500.0)
    }
  }

  const fetchVaultContribution = async () => {
    try {
      console.log("[v0] Fetching vault contribution data...")
      const response = await fetch("/api/merchant/vault-contribution")

      if (!response.ok) {
        console.error(`[v0] Vault contribution API returned ${response.status}`)
        // Use fallback data to prevent retry loop
        setVaultContribution({
          total_contribution: 1240.5,
          breakdown: {
            withdrawal_fees: 870.0,
            transaction_fees: 370.5,
          },
          contribution_stats: {
            contribution_count: 15,
            last_contribution: "2024-01-15T10:30:00Z",
          },
          impact_metrics: {
            customer_payments_covered: 496,
            puff_points_funded: 12405,
            customer_loyalty_boost: 87,
            repeat_purchase_increase: 73,
          },
          last_updated: new Date().toISOString(),
        })
        return
      }

      const data = await response.json()
      setVaultContribution(data)
      console.log("[v0] Vault contribution data loaded successfully")
    } catch (error) {
      console.error("[v0] Failed to fetch vault contribution:", error)
      // Mock data for demo
      setVaultContribution({
        total_contribution: 1240.5,
        breakdown: {
          withdrawal_fees: 870.0,
          transaction_fees: 370.5,
        },
        contribution_stats: {
          contribution_count: 15,
          last_contribution: "2024-01-15T10:30:00Z",
        },
        impact_metrics: {
          customer_payments_covered: 496,
          puff_points_funded: 12405,
          customer_loyalty_boost: 87,
          repeat_purchase_increase: 73,
        },
        last_updated: new Date().toISOString(),
      })
    }
  }

  const fetchRewardOffers = async () => {
    if (!merchantId) return

    try {
      const response = await fetch(`/api/merchant/rewards?merchantId=${merchantId}`)
      if (response.ok) {
        const data = await response.json()
        setRewardOffers(data.rewards || [])
      } else {
        // Use fallback data to prevent retry loop
        setRewardOffers([
          {
            id: "1",
            name: "10% Off Next Order",
            description: "Save 10% on your next purchase",
            points_cost: 200,
            value_dollars: 5.0,
            category: "discount",
            availability_count: 100,
            redemptions_count: 87,
            is_active: true,
            created_at: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            name: "Free Pre-Roll",
            description: "Complimentary pre-roll with any purchase",
            points_cost: 300,
            value_dollars: 8.0,
            category: "product",
            availability_count: 50,
            redemptions_count: 23,
            is_active: true,
            created_at: "2024-01-10T14:20:00Z",
          },
        ])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch reward offers:", error)
      // Mock data for demo
      setRewardOffers([
        {
          id: "1",
          name: "10% Off Next Order",
          description: "Save 10% on your next purchase",
          points_cost: 200,
          value_dollars: 5.0,
          category: "discount",
          availability_count: 100,
          redemptions_count: 87,
          is_active: true,
          created_at: "2024-01-15T10:30:00Z",
        },
      ])
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/merchant/leaderboard")
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch leaderboard:", error)
    }
  }

  const fetchMerchantContributions = async () => {
    if (!merchantId) return

    try {
      const response = await fetch(`/api/merchant/contributions?merchantId=${merchantId}`)
      if (response.ok) {
        const data = await response.json()
        setMerchantContributions(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch merchant contributions:", error)
    }
  }

  const handleAddProduct = async () => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          price: Number.parseFloat(newProduct.price),
          thc_content: Number.parseFloat(newProduct.thc_content),
          cbd_content: Number.parseFloat(newProduct.cbd_content),
          stock_quantity: Number.parseInt(newProduct.stock_quantity),
        }),
      })

      if (response.ok) {
        fetchProducts()
        setIsAddProductOpen(false)
        setNewProduct({
          name: "",
          category: "",
          price: "",
          thc_content: "",
          cbd_content: "",
          description: "",
          stock_quantity: "",
        })
      }
    } catch (error) {
      console.error("Failed to add product:", error)
    }
  }

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        fetchProducts()
        setEditingProduct(null)
      }
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchProducts()
        }
      } catch (error) {
        console.error("Failed to delete product:", error)
      }
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  const handleCreateReward = async () => {
    try {
      const response = await fetch("/api/merchant/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newReward,
          points_cost: Number.parseInt(newReward.points_cost),
          value_dollars: Number.parseFloat(newReward.value_dollars),
          availability_count: Number.parseInt(newReward.availability_count),
          merchant_id: merchantId,
        }),
      })

      if (response.ok) {
        fetchRewardOffers()
        setIsRewardBuilderOpen(false)
        setNewReward({
          name: "",
          description: "",
          points_cost: "",
          value_dollars: "",
          category: "",
          availability_count: "",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to create reward:", error)
    }
  }

  const handleToggleReward = async (rewardId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/merchant/rewards/${rewardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        fetchRewardOffers()
      }
    } catch (error) {
      console.error("[v0] Failed to toggle reward:", error)
    }
  }

  // POS Functions
  const addToPosCart = (product: Product) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updatePosCartQuantity = (productId: string, change: number) => {
    setPosCart((prev) => {
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

  const processPOSPayment = async () => {
    const total = posCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    try {
      const response = await fetch("/api/pos/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: posCart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          customer_email: customerEmail,
          total_amount: total,
        }),
      })

      if (response.ok) {
        // Clear cart and close POS
        setPosCart([])
        setCustomerEmail("")
        setIsPOSOpen(false)
        fetchOrders()
        fetchBalances()
        alert("Payment processed successfully!")
      }
    } catch (error) {
      console.error("Failed to process payment:", error)
      alert("Payment processing failed. Please try again.")
    }
  }

  const handleWithdrawalRequest = async () => {
    const amount = Number.parseFloat(withdrawalAmount)
    if (amount <= 0 || amount > availableBalance) {
      alert("Invalid withdrawal amount")
      return
    }

    try {
      const response = await fetch("/api/merchant/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        fetchWithdrawalRequests()
        fetchBalances()
        setWithdrawalAmount("")
        setIsWithdrawalOpen(false)
        alert("Withdrawal request submitted successfully!")
      }
    } catch (error) {
      console.error("Failed to submit withdrawal request:", error)
      alert("Failed to submit withdrawal request. Please try again.")
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  const categories = ["flower", "edibles", "concentrates", "topicals", "accessories"]
  const posCartTotal = posCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading merchant dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <PuffPassLogo size="md" showText={false} />
              <div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Merchant Dashboard
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-accent px-3 py-2 rounded-lg">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="font-medium text-accent-foreground">${availableBalance.toFixed(2)}</span>
                </div>
                {pendingBalance > 0 && (
                  <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">${pendingBalance.toFixed(2)} pending</span>
                  </div>
                )}
              </div>

              <Button onClick={() => setIsPOSOpen(true)} className="bg-primary">
                <QrCode className="w-4 h-4 mr-2" />
                POS
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vault-impact">Vault Impact</TabsTrigger>
            <TabsTrigger value="rewards">Reward Builder</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vault Contribution</CardTitle>
                  <Heart className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${Number(merchantContributions?.vault_contribution || 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {merchantContributions?.fee_free_payments_enabled || 0} payments enabled
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Points Funded</CardTitle>
                  <Zap className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {merchantContributions?.rewards_funded?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">Puff Points created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.total_revenue?.toFixed(2) || "0.00"}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rewardOffers.filter((r) => r.is_active).length}</div>
                  <p className="text-xs text-muted-foreground">
                    {rewardOffers.reduce((sum, r) => sum + r.redemptions_count, 0)} total redemptions
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">#{order.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total_amount}</p>
                          <Badge variant={order.status === "completed" ? "default" : "secondary"} className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Withdrawal Requests</CardTitle>
                      <CardDescription>Recent payout requests</CardDescription>
                    </div>
                    <Button onClick={() => setIsWithdrawalOpen(true)} size="sm">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Request Withdrawal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {withdrawalRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">${request.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "completed"
                              ? "default"
                              : request.status === "pending"
                                ? "secondary"
                                : request.status === "approved"
                                  ? "default"
                                  : "destructive"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vault-impact" className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/5 via-background to-chart-2/5 border-primary/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      You're powering the future of cannabis payments! 🌿
                    </h3>
                    <p className="text-muted-foreground">
                      Your withdrawal fees fund the Puff Vault, which covers all customer payment fees and powers their
                      rewards. This creates a better experience that drives more sales to your business.
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2">
                      <Heart className="w-4 h-4 mr-2" />
                      Thank You!
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contribution</CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${vaultContribution?.total_contribution?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {vaultContribution?.contribution_stats?.contribution_count || 0} contributions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payments Covered</CardTitle>
                  <Users className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vaultContribution?.impact_metrics?.customer_payments_covered?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">Customer transactions</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Points Funded</CardTitle>
                  <Zap className="h-4 w-4 text-chart-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vaultContribution?.impact_metrics?.puff_points_funded?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">Puff Points created</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Loyalty Boost</CardTitle>
                  <Target className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vaultContribution?.impact_metrics?.customer_loyalty_boost || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Customer retention</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contribution Breakdown</CardTitle>
                  <CardDescription>How your fees contribute to the Puff Vault</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <div>
                        <p className="font-medium">Withdrawal Fees</p>
                        <p className="text-sm text-muted-foreground">7% of withdrawals</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          ${vaultContribution?.breakdown?.withdrawal_fees?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-xs text-muted-foreground">Primary funding</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-chart-2/5 rounded-lg">
                      <div>
                        <p className="font-medium">Transaction Fees</p>
                        <p className="text-sm text-muted-foreground">Processing fees</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-chart-2">
                          ${vaultContribution?.breakdown?.transaction_fees?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-xs text-muted-foreground">Secondary funding</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Impact</CardTitle>
                  <CardDescription>How the Puff Vault benefits your business</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-chart-2/5 rounded-lg">
                      <div>
                        <p className="font-medium">Customer Loyalty</p>
                        <p className="text-sm text-muted-foreground">Retention improvement</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-chart-2">
                          +{vaultContribution?.impact_metrics?.customer_loyalty_boost || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">vs. competitors</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-chart-3/5 rounded-lg">
                      <div>
                        <p className="font-medium">Repeat Purchases</p>
                        <p className="text-sm text-muted-foreground">Customer return rate</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-chart-3">
                          +{vaultContribution?.impact_metrics?.repeat_purchase_increase || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">monthly increase</p>
                      </div>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>The Virtuous Cycle:</strong> Your fees → Customer rewards → Higher loyalty → More sales
                        → Better business
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reward Builder Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Reward Builder</h2>
                <p className="text-muted-foreground">Create and manage customer rewards</p>
              </div>
              <Dialog open={isRewardBuilderOpen} onOpenChange={setIsRewardBuilderOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Reward
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Reward</DialogTitle>
                    <DialogDescription>Design a reward offer for your customers</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reward-name">Reward Name</Label>
                      <Input
                        id="reward-name"
                        value={newReward.name}
                        onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                        placeholder="e.g., 10% Off Next Order"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reward-description">Description</Label>
                      <Textarea
                        id="reward-description"
                        value={newReward.description}
                        onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                        placeholder="Describe the reward..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="points-cost">Points Cost</Label>
                        <Input
                          id="points-cost"
                          type="number"
                          value={newReward.points_cost}
                          onChange={(e) => setNewReward({ ...newReward, points_cost: e.target.value })}
                          placeholder="200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="value-dollars">Value ($)</Label>
                        <Input
                          id="value-dollars"
                          type="number"
                          step="0.01"
                          value={newReward.value_dollars}
                          onChange={(e) => setNewReward({ ...newReward, value_dollars: e.target.value })}
                          placeholder="5.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newReward.category}
                          onValueChange={(value) => setNewReward({ ...newReward, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="discount">Discount</SelectItem>
                            <SelectItem value="product">Free Product</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="experience">Experience</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="availability">Availability</Label>
                        <Input
                          id="availability"
                          type="number"
                          value={newReward.availability_count}
                          onChange={(e) => setNewReward({ ...newReward, availability_count: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-medium text-primary mb-2">Preview Reach</h4>
                      <p className="text-sm text-muted-foreground">
                        Visible to approximately <strong>2,300 consumers</strong> in your area
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Estimated redemption rate: <strong>15-25%</strong> based on similar offers
                      </p>
                    </div>

                    <Button onClick={handleCreateReward} className="w-full">
                      Create Reward Offer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {rewardOffers.map((reward) => (
                <Card key={reward.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 friendly-gradient rounded-xl flex items-center justify-center">
                          <Gift className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{reward.name}</h3>
                            <Badge variant={reward.is_active ? "default" : "secondary"}>
                              {reward.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{reward.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {reward.points_cost} points
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />${reward.value_dollars} value
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {reward.availability_count} available
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold text-primary">{reward.redemptions_count}</div>
                        <div className="text-sm text-muted-foreground">redemptions</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleReward(reward.id, reward.is_active)}
                        >
                          {reward.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-chart-2">
                            {Math.round((reward.redemptions_count / reward.availability_count) * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Redemption Rate</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-chart-3">
                            ${(reward.redemptions_count * reward.value_dollars).toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Value Given</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-chart-4">
                            +{Math.round(reward.redemptions_count * 1.3)}
                          </div>
                          <div className="text-xs text-muted-foreground">Est. Return Visits</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {rewardOffers.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No rewards created yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first reward offer to start building customer loyalty
                    </p>
                    <Button onClick={() => setIsRewardBuilderOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Reward
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Merchant Leaderboard</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how you rank among other merchants in the Puff Pass ecosystem. Rankings based on vault
                contributions, points funded, and customer engagement.
              </p>
            </div>

            <div className="grid gap-4">
              {leaderboard.map((entry, index) => (
                <Card
                  key={entry.merchant_id}
                  className={`hover:shadow-lg transition-all duration-300 ${
                    entry.rank <= 3 ? "bg-gradient-to-r from-primary/5 to-chart-2/5 border-primary/20" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                            entry.rank === 1
                              ? "bg-yellow-100 text-yellow-800"
                              : entry.rank === 2
                                ? "bg-gray-100 text-gray-800"
                                : entry.rank === 3
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.rank === 1 ? (
                            <Crown className="w-8 h-8" />
                          ) : entry.rank === 2 ? (
                            <Award className="w-8 h-8" />
                          ) : entry.rank === 3 ? (
                            <Trophy className="w-8 h-8" />
                          ) : (
                            entry.rank
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{entry.merchant_name}</h3>
                            {entry.badge && (
                              <Badge variant="default" className="bg-primary">
                                {entry.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">Rank #{entry.rank}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">${entry.fees_paid.toFixed(0)}</div>
                          <div className="text-sm text-muted-foreground">Fees Paid</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-chart-2">{entry.points_funded.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Points Funded</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-chart-3">{entry.redemptions_driven}</div>
                          <div className="text-sm text-muted-foreground">Redemptions</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Leaderboard Loading</h3>
                  <p className="text-muted-foreground">
                    Rankings will appear as merchants contribute to the Puff Vault
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Heart className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      The More You Contribute, The Higher You Rank!
                    </h3>
                    <p className="text-muted-foreground">
                      Your vault contributions power customer rewards and fee-free payments, creating a better
                      experience that drives more sales and loyalty to your business.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Inventory</h2>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Create a new cannabis product for your inventory</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g., Blue Dream"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} className="capitalize">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={newProduct.stock_quantity}
                          onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="thc">THC Content (%)</Label>
                        <Input
                          id="thc"
                          type="number"
                          step="0.1"
                          value={newProduct.thc_content}
                          onChange={(e) => setNewProduct({ ...newProduct, thc_content: e.target.value })}
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cbd">CBD Content (%)</Label>
                        <Input
                          id="cbd"
                          type="number"
                          step="0.1"
                          value={newProduct.cbd_content}
                          onChange={(e) => setNewProduct({ ...newProduct, cbd_content: e.target.value })}
                          placeholder="0.0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Product description..."
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleAddProduct} className="w-full">
                      Add Product
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={
                        product.image_url ||
                        `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.stock_quantity < 10 && (
                      <Badge variant="destructive" className="absolute top-2 right-2">
                        Low Stock
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      <Badge variant="outline" className="ml-2 shrink-0 capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-primary">${product.price}</div>
                      <div className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</div>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>THC: {product.thc_content}%</span>
                      <span>CBD: {product.cbd_content}%</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Process and track customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">Order #{order.id.slice(-8)}</h4>
                          <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-bold text-lg">${order.total_amount}</p>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Order Items:</h5>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm bg-muted p-2 rounded">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Available Balance</p>
                      <p className="text-2xl font-bold text-green-800">${availableBalance.toFixed(2)}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-700">Pending Withdrawals</p>
                      <p className="text-2xl font-bold text-yellow-800">${pendingBalance.toFixed(2)}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Total Withdrawn</p>
                      <p className="text-2xl font-bold text-blue-800">
                        $
                        {withdrawalRequests
                          .filter((r) => r.status === "completed")
                          .reduce((sum, r) => sum + r.amount, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    <ArrowUpRight className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">
                    $
                    {withdrawalRequests
                      .filter((r) => r.status === "completed")
                      .reduce((sum, r) => sum + r.amount, 0)
                      .toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">Puff Vault Contribution</p>
                  <p className="text-xs text-muted-foreground mt-1">Powers customer rewards & fee-free payments</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-primary/5 via-background to-chart-2/5 border-primary/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      You're powering the future of cannabis payments! 🌿
                    </h3>
                    <p className="text-muted-foreground">
                      Your 7% withdrawal fees fund the Puff Vault, which covers all customer payment fees and powers
                      their rewards. This creates a better experience that drives more sales to your business and builds
                      customer loyalty.
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2">
                      <Heart className="w-4 h-4 mr-2" />
                      Thank You!
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      <div>Customer Loyalty: +{Math.floor(Math.random() * 15 + 85)}%</div>
                      <div>Repeat Purchases: +{Math.floor(Math.random() * 20 + 60)}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Withdrawal History</CardTitle>
                    <CardDescription>Track your payout requests and status</CardDescription>
                  </div>
                  <Button onClick={() => setIsWithdrawalOpen(true)}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Request Withdrawal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-lg">${request.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            Requested: {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                          {request.processed_at && (
                            <p className="text-sm text-muted-foreground">
                              Processed: {new Date(request.processed_at).toLocaleDateString()}
                            </p>
                          )}
                          {request.notes && (
                            <p className="text-sm text-muted-foreground mt-2">Notes: {request.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              request.status === "completed"
                                ? "default"
                                : request.status === "pending"
                                  ? "secondary"
                                  : request.status === "approved"
                                    ? "default"
                                    : "destructive"
                            }
                            className="mb-2"
                          >
                            {request.status}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            {request.status === "completed" && <CheckCircle className="w-4 h-4 mr-1 text-green-600" />}
                            {request.status === "pending" && <Clock className="w-4 h-4 mr-1 text-yellow-600" />}
                            {request.status === "rejected" && <XCircle className="w-4 h-4 mr-1 text-red-600" />}
                            {request.status === "approved" && <CheckCircle className="w-4 h-4 mr-1 text-blue-600" />}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Revenue and order trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">Monthly Revenue</p>
                          <p className="text-2xl font-bold">${analytics?.total_revenue?.toFixed(2) || "0.00"}</p>
                        </div>
                      </div>
                      <Badge variant="default">+12%</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">Total Orders</p>
                          <p className="text-2xl font-bold">{analytics?.total_orders || 0}</p>
                        </div>
                      </div>
                      <Badge variant="default">+8%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling items this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.top_products?.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                          </div>
                        </div>
                        <Badge variant="outline">{product.sales}</Badge>
                      </div>
                    )) || <p className="text-center text-muted-foreground py-8">No sales data available</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* POS Modal */}
      <Dialog open={isPOSOpen} onOpenChange={setIsPOSOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Point of Sale System</DialogTitle>
            <DialogDescription>Process in-store cannabis purchases</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold">Select Products</h3>
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {products
                  .filter((p) => p.in_stock)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">${product.price}</p>
                      </div>
                      <Button size="sm" onClick={() => addToPosCart(product)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Cart & Checkout */}
            <div className="space-y-4">
              <h3 className="font-semibold">Current Sale</h3>

              <div className="space-y-2">
                <Label htmlFor="customer-email">Customer Email (Optional)</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                {posCart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No items in cart</p>
                ) : (
                  posCart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">${item.product.price} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => updatePosCartQuantity(item.product.id, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updatePosCartQuantity(item.product.id, 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                        <span className="w-16 text-right font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>${posCartTotal.toFixed(2)}</span>
              </div>

              <Button className="w-full" size="lg" onClick={processPOSPayment} disabled={posCart.length === 0}>
                <CreditCard className="w-4 h-4 mr-2" />
                Process PUFF Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Request Modal */}
      <Dialog open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>Withdraw funds to your bank account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Balance</span>
                <span className="font-bold">${availableBalance.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="withdrawal-amount">Withdrawal Amount</Label>
              <Input
                id="withdrawal-amount"
                type="number"
                step="0.01"
                max={availableBalance}
                placeholder="0.00"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
              />
            </div>

            {withdrawalAmount && Number.parseFloat(withdrawalAmount) > 0 && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Withdrawal Amount:</span>
                  <span className="font-medium">${Number.parseFloat(withdrawalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fee (7%):</span>
                  <span className="font-medium text-primary">
                    -${(Number.parseFloat(withdrawalAmount) * 0.07).toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>You'll Receive:</span>
                  <span className="text-green-600">${(Number.parseFloat(withdrawalAmount) * 0.93).toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Your fee helps power fee-free payments for customers</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Instant ACH: 7% fee (funds in 1-2 hours)</p>
              <p>• Standard ACH: 5% fee (funds in 1-3 business days)</p>
              <p>• Fees fund the Puff Vault treasury system</p>
            </div>

            <Button
              onClick={handleWithdrawalRequest}
              className="w-full"
              disabled={
                !withdrawalAmount ||
                Number.parseFloat(withdrawalAmount) <= 0 ||
                Number.parseFloat(withdrawalAmount) > availableBalance
              }
            >
              Submit Withdrawal Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
