"use client"

import { useState, useEffect } from "react"
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
  Package,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
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
} from "lucide-react"

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

export default function MerchantDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
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

  useEffect(() => {
    fetchProducts()
    fetchOrders()
    fetchAnalytics()
    fetchWithdrawalRequests()
    fetchBalances()
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
      const response = await fetch("/api/merchant/withdrawals")
      if (response.ok) {
        const data = await response.json()
        setWithdrawalRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error)
      // Mock data for demo
      setWithdrawalRequests([
        {
          id: "1",
          amount: 500,
          status: "pending",
          requested_at: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
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
      const response = await fetch("/api/merchant/balance")
      if (response.ok) {
        const data = await response.json()
        setAvailableBalance(data.available || 0)
        setPendingBalance(data.pending || 0)
      }
    } catch (error) {
      console.error("Failed to fetch balances:", error)
      // Mock data for demo
      setAvailableBalance(2450.75)
      setPendingBalance(500.0)
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

  if (loading) {
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
              <h1 className="text-2xl font-bold text-foreground">🍃 PuffPass</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Merchant Dashboard
              </Badge>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
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
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_orders || 0}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {products.filter((p) => p.stock_quantity < 10).length} low stock
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
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
            </div>

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
            <DialogDescription>Request a payout from your available balance</DialogDescription>
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

            <div className="text-sm text-muted-foreground">
              <p>• Withdrawals are processed within 1-3 business days</p>
              <p>• Admin approval required for amounts over $1,000</p>
              <p>• Processing fee: 2.5% of withdrawal amount</p>
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
