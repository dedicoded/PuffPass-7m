"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Store,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  FileText,
  BarChart3,
  Clock,
  Search,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Coins,
  Heart,
  Users,
  Zap,
  Target,
} from "lucide-react"
import { FloatAllocationDashboard } from "@/components/admin/float-allocation-dashboard"

interface MerchantApplication {
  id: string
  business_name: string
  owner_name: string
  email: string
  phone: string
  address: string
  license_number: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  documents: string[]
}

interface User {
  id: string
  email: string
  role: string
  created_at: string
  last_login: string
  status: "active" | "suspended"
  puff_balance?: number
}

interface PlatformAnalytics {
  total_merchants: number
  total_customers: number
  total_revenue: number
  pending_approvals: number
  monthly_growth: number
  compliance_score: number
  total_puff_supply: number
  circulating_puff: number
  pending_withdrawals: number
}

interface ComplianceAlert {
  id: string
  merchant_name: string
  type: string
  severity: "low" | "medium" | "high"
  description: string
  created_at: string
  status: "open" | "resolved"
}

interface WithdrawalRequest {
  id: string
  merchant_id: string
  merchant_name: string
  amount: number
  status: "pending" | "approved" | "rejected" | "completed"
  requested_at: string
  processed_at?: string
  notes?: string
  processing_fee: number
}

interface Transaction {
  id: string
  user_email: string
  type: "onramp" | "purchase" | "withdrawal" | "reward"
  amount: number
  puff_amount: number
  status: "completed" | "pending" | "failed"
  created_at: string
  merchant_name?: string
}

interface VaultSummary {
  total_balance: number
  breakdown: Record<string, number>
  vault_health: {
    status: string
    reserve_ratio: number
    fee_coverage_days: number
  }
  last_updated: string
}

interface MerchantContributions {
  total_contributions: number
  merchants: Array<{
    merchant_id: string
    total_fees: number
    withdrawal_fees: number
    transaction_fees: number
    last_activity: string
    contribution_count: number
  }>
  last_updated: string
}

interface RewardsPool {
  rewards_pool_balance: number
  allocation_percent: number
  lifetime_distributed: number
  pending_redemptions: number
  total_user_points: number
  redemption_stats: {
    completed_redemptions: number
    pending_redemptions: number
  }
  last_updated: string
}

interface FloatManagement {
  total_float: number
  allocations: {
    stablecoins: number
    fiat_reserves: number
    yield_deployment: number
  }
  yield_metrics: {
    current_apy: number
    projected_monthly_yield: number
    projected_annual_yield: number
  }
  float_utilization: {
    utilization_rate: number
    target_utilization: number
    available_for_deployment: number
  }
  last_updated: string
}

export default function AdminDashboard() {
  const [merchantApplications, setMerchantApplications] = useState<MerchantApplication[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<MerchantApplication | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [withdrawalNotes, setWithdrawalNotes] = useState("")

  // Added live vault data state
  const [vaultSummary, setVaultSummary] = useState<VaultSummary | null>(null)
  const [merchantContributions, setMerchantContributions] = useState<MerchantContributions | null>(null)
  const [rewardsPool, setRewardsPool] = useState<RewardsPool | null>(null)
  const [floatManagement, setFloatManagement] = useState<FloatManagement | null>(null)

  useEffect(() => {
    fetchMerchantApplications()
    fetchUsers()
    fetchAnalytics()
    fetchComplianceAlerts()
    fetchWithdrawalRequests()
    fetchTransactions()
    fetchVaultSummary()
    fetchMerchantContributions()
    fetchRewardsPool()
    fetchFloatManagement()
  }, [])

  const fetchMerchantApplications = async () => {
    try {
      const response = await fetch("/api/admin/merchants")
      if (response.ok) {
        const data = await response.json()
        setMerchantApplications(data.applications || [])
      }
    } catch (error) {
      console.error("Failed to fetch merchant applications:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      // Mock data for demo
      setAnalytics({
        total_merchants: 45,
        total_customers: 1250,
        total_revenue: 125000,
        pending_approvals: 3,
        monthly_growth: 15,
        compliance_score: 94,
        total_puff_supply: 1000000,
        circulating_puff: 750000,
        pending_withdrawals: 5,
      })
    }
  }

  const fetchComplianceAlerts = async () => {
    try {
      const response = await fetch("/api/admin/compliance")
      if (response.ok) {
        const data = await response.json()
        setComplianceAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error("Failed to fetch compliance alerts:", error)
    }
  }

  const fetchWithdrawalRequests = async () => {
    try {
      const response = await fetch("/api/admin/withdrawals")
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
          merchant_id: "m1",
          merchant_name: "Green Valley Dispensary",
          amount: 1500,
          status: "pending",
          requested_at: "2024-01-15T10:30:00Z",
          processing_fee: 37.5,
        },
        {
          id: "2",
          merchant_id: "m2",
          merchant_name: "Cannabis Corner",
          amount: 750,
          status: "pending",
          requested_at: "2024-01-14T15:45:00Z",
          processing_fee: 18.75,
        },
        {
          id: "3",
          merchant_id: "m3",
          merchant_name: "Herb Haven",
          amount: 2200,
          status: "approved",
          requested_at: "2024-01-12T09:15:00Z",
          processed_at: "2024-01-13T11:30:00Z",
          processing_fee: 55.0,
          notes: "Approved after verification",
        },
      ])
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/admin/transactions")
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
          user_email: "customer@example.com",
          type: "onramp",
          amount: 100,
          puff_amount: 95.24,
          status: "completed",
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          user_email: "customer@example.com",
          type: "purchase",
          amount: 45.99,
          puff_amount: -45.99,
          status: "completed",
          created_at: "2024-01-14T15:45:00Z",
          merchant_name: "Green Valley Dispensary",
        },
        {
          id: "3",
          user_email: "merchant@example.com",
          type: "withdrawal",
          amount: 500,
          puff_amount: -500,
          status: "pending",
          created_at: "2024-01-12T09:15:00Z",
        },
      ])
    }
  }

  const fetchVaultSummary = async () => {
    try {
      const response = await fetch("/api/admin/vault/summary")
      if (response.ok) {
        const data = await response.json()
        setVaultSummary(data)
      }
    } catch (error) {
      console.error("Failed to fetch vault summary:", error)
    }
  }

  const fetchMerchantContributions = async () => {
    try {
      const response = await fetch("/api/admin/vault/merchant-contributions")
      if (response.ok) {
        const data = await response.json()
        setMerchantContributions(data)
      }
    } catch (error) {
      console.error("Failed to fetch merchant contributions:", error)
    }
  }

  const fetchRewardsPool = async () => {
    try {
      const response = await fetch("/api/admin/vault/rewards-pool")
      if (response.ok) {
        const data = await response.json()
        setRewardsPool(data)
      }
    } catch (error) {
      console.error("Failed to fetch rewards pool:", error)
    }
  }

  const fetchFloatManagement = async () => {
    try {
      const response = await fetch("/api/admin/vault/float-management")
      if (response.ok) {
        const data = await response.json()
        setFloatManagement(data)
      }
    } catch (error) {
      console.error("Failed to fetch float management:", error)
    }
  }

  const handleMerchantApproval = async (merchantId: string, approved: boolean, notes?: string) => {
    try {
      const endpoint = approved
        ? `/api/admin/merchants/${merchantId}/approve`
        : `/api/admin/merchants/${merchantId}/reject`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        fetchMerchantApplications()
        setSelectedApplication(null)
      }
    } catch (error) {
      console.error("Failed to process merchant application:", error)
    }
  }

  const handleWithdrawalApproval = async (withdrawalId: string, approved: boolean) => {
    try {
      const endpoint = approved
        ? `/api/admin/withdrawals/${withdrawalId}/approve`
        : `/api/admin/withdrawals/${withdrawalId}/reject`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: withdrawalNotes }),
      })

      if (response.ok) {
        fetchWithdrawalRequests()
        fetchAnalytics()
        setSelectedWithdrawal(null)
        setWithdrawalNotes("")
        alert(`Withdrawal ${approved ? "approved" : "rejected"} successfully!`)
      }
    } catch (error) {
      console.error("Failed to process withdrawal request:", error)
      alert("Failed to process withdrawal request. Please try again.")
    }
  }

  const handleUserStatusUpdate = async (userId: string, status: "active" | "suspended") => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to update user status:", error)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  const filteredApplications = merchantApplications.filter(
    (app) =>
      app.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingApplications = merchantApplications.filter((app) => app.status === "pending")
  const pendingWithdrawals = withdrawalRequests.filter((req) => req.status === "pending")
  const highPriorityAlerts = complianceAlerts.filter((alert) => alert.severity === "high" && alert.status === "open")

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
                Platform Admin
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-accent px-3 py-2 rounded-lg">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium text-accent-foreground">Administrator</span>
              </div>

              {(pendingApplications.length > 0 || pendingWithdrawals.length > 0) && (
                <div className="flex items-center space-x-2">
                  {pendingApplications.length > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {pendingApplications.length} Apps
                    </Badge>
                  )}
                  {pendingWithdrawals.length > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {pendingWithdrawals.length} Withdrawals
                    </Badge>
                  )}
                </div>
              )}

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
            {/* Added new Puff Vault tab */}
            <TabsTrigger value="vault">Puff Vault</TabsTrigger>
            <TabsTrigger value="float">Float Management</TabsTrigger>
            <TabsTrigger value="merchants">Merchants</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Puff Vault Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${vaultSummary?.total_balance?.toLocaleString() || "0"}</div>
                  <p className="text-xs text-muted-foreground">
                    Status: {vaultSummary?.vault_health?.status || "loading"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rewards Pool</CardTitle>
                  <Heart className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${rewardsPool?.rewards_pool_balance?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rewardsPool?.total_user_points?.toLocaleString() || "0"} user points
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.total_revenue?.toLocaleString() || "0"}</div>
                  <p className="text-xs text-muted-foreground">+{analytics?.monthly_growth || 0}% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_merchants || 0}</div>
                  <p className="text-xs text-muted-foreground">{pendingApplications.length} pending approval</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Merchant Applications</CardTitle>
                  <CardDescription>Applications requiring review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingApplications.slice(0, 5).map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{application.business_name}</p>
                          <p className="text-sm text-muted-foreground">{application.owner_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}>
                            <Eye className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingApplications.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No pending applications</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Withdrawals</CardTitle>
                  <CardDescription>Merchant payout requests requiring approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingWithdrawals.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{request.merchant_name}</p>
                          <p className="text-sm text-muted-foreground">${request.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedWithdrawal(request)}>
                            <Eye className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingWithdrawals.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No pending withdrawals</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Transactions</CardTitle>
                <CardDescription>Latest PUFF token activity across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 8).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "onramp"
                              ? "bg-green-100 text-green-600"
                              : transaction.type === "purchase"
                                ? "bg-blue-100 text-blue-600"
                                : transaction.type === "withdrawal"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {transaction.type === "onramp" ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : transaction.type === "purchase" ? (
                            <CreditCard className="w-5 h-5" />
                          ) : transaction.type === "withdrawal" ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <Coins className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">{transaction.user_email}</p>
                          {transaction.merchant_name && (
                            <p className="text-xs text-muted-foreground">via {transaction.merchant_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.puff_amount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {transaction.puff_amount > 0 ? "+" : ""}
                          {transaction.puff_amount.toFixed(2)} PUFF
                        </p>
                        <p className="text-sm text-muted-foreground">${transaction.amount.toFixed(2)}</p>
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

          <TabsContent value="vault" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vault Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${vaultSummary?.total_balance?.toLocaleString() || "0"}</div>
                  <p className="text-xs text-muted-foreground">
                    {vaultSummary?.vault_health?.fee_coverage_days || 0} days coverage
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Merchant Contributions</CardTitle>
                  <Users className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${merchantContributions?.total_contributions?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {merchantContributions?.merchants?.length || 0} contributing merchants
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Float Management</CardTitle>
                  <Target className="h-4 w-4 text-chart-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${floatManagement?.total_float?.toLocaleString() || "0"}</div>
                  <p className="text-xs text-muted-foreground">
                    ${floatManagement?.yield_metrics?.projected_monthly_yield?.toFixed(2) || "0"}/mo yield
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rewards Distributed</CardTitle>
                  <Zap className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rewardsPool?.redemption_stats?.completed_redemptions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {rewardsPool?.redemption_stats?.pending_redemptions || 0} pending
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributing Merchants</CardTitle>
                  <CardDescription>Merchants funding the Puff Vault ecosystem</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {merchantContributions?.merchants?.slice(0, 5).map((merchant, index) => (
                      <div
                        key={merchant.merchant_id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{merchant.merchant_id}</p>
                            <p className="text-sm text-muted-foreground">{merchant.contribution_count} contributions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${merchant.total_fees.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Last: {new Date(merchant.last_activity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )) || <p className="text-center text-muted-foreground py-8">Loading merchant data...</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Float Allocation</CardTitle>
                  <CardDescription>How user funds are managed for yield generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <div>
                        <p className="font-medium">Stablecoins (USDC/DAI)</p>
                        <p className="text-sm text-muted-foreground">70% allocation</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${floatManagement?.allocations?.stablecoins?.toLocaleString() || "0"}
                        </p>
                        <p className="text-xs text-muted-foreground">Ready for yield</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-chart-2/5 rounded-lg">
                      <div>
                        <p className="font-medium">Fiat Reserves</p>
                        <p className="text-sm text-muted-foreground">25% allocation</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${floatManagement?.allocations?.fiat_reserves?.toLocaleString() || "0"}
                        </p>
                        <p className="text-xs text-muted-foreground">Instant liquidity</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-chart-3/5 rounded-lg">
                      <div>
                        <p className="font-medium">Yield Deployment</p>
                        <p className="text-sm text-muted-foreground">5% allocation</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${floatManagement?.allocations?.yield_deployment?.toLocaleString() || "0"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((floatManagement?.yield_metrics?.current_apy || 0) * 100).toFixed(1)}% APY
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="float" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Float Allocation Engine</h2>
                <p className="text-muted-foreground">
                  Manage idle balance deployment for yield generation while maintaining liquidity
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Live Yield Management
              </Badge>
            </div>

            <FloatAllocationDashboard />
          </TabsContent>

          {/* Merchants Tab */}
          <TabsContent value="merchants" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Merchant Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search merchants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{application.business_name}</CardTitle>
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "default"
                            : application.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                    <CardDescription>{application.owner_name}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Email:</span> {application.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {application.phone}
                      </p>
                      <p>
                        <span className="font-medium">License:</span> {application.license_number}
                      </p>
                      <p>
                        <span className="font-medium">Applied:</span>{" "}
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                        className="flex-1"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-700">Pending Requests</p>
                      <p className="text-2xl font-bold text-yellow-800">{pendingWithdrawals.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Pending Amount</p>
                      <p className="text-2xl font-bold text-blue-800">
                        ${pendingWithdrawals.reduce((sum, req) => sum + req.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <Wallet className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Approved Today</p>
                      <p className="text-2xl font-bold text-green-800">
                        {
                          withdrawalRequests.filter(
                            (r) =>
                              r.status === "approved" &&
                              new Date(r.processed_at || "").toDateString() === new Date().toDateString(),
                          ).length
                        }
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700">Processing Fees</p>
                      <p className="text-2xl font-bold text-red-800">
                        ${withdrawalRequests.reduce((sum, req) => sum + req.processing_fee, 0).toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Review and approve merchant payout requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-lg">{request.merchant_name}</h4>
                          <p className="text-2xl font-bold text-primary">${request.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Processing fee: ${request.processing_fee.toFixed(2)} (2.5%)
                          </p>
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
                        <div className="text-right space-y-2">
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
                          {request.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={() => setSelectedWithdrawal(request)}>
                                <Eye className="w-3 h-3 mr-1" />
                                Review
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src="/diverse-user-avatars.png" />
                          <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                            <span>•</span>
                            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            {user.puff_balance && (
                              <>
                                <span>•</span>
                                <span>{user.puff_balance.toFixed(2)} PUFF</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUserStatusUpdate(user.id, user.status === "active" ? "suspended" : "active")
                          }
                        >
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Monitoring</CardTitle>
                <CardDescription>Track regulatory compliance across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle
                            className={`w-5 h-5 ${
                              alert.severity === "high"
                                ? "text-destructive"
                                : alert.severity === "medium"
                                  ? "text-yellow-500"
                                  : "text-blue-500"
                            }`}
                          />
                          <div>
                            <h4 className="font-medium">{alert.merchant_name}</h4>
                            <p className="text-sm text-muted-foreground">{alert.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              alert.severity === "high"
                                ? "destructive"
                                : alert.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {alert.severity}
                          </Badge>
                          <Badge variant={alert.status === "open" ? "destructive" : "default"}>{alert.status}</Badge>
                        </div>
                      </div>

                      <p className="text-sm mb-3">{alert.description}</p>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Created {new Date(alert.created_at).toLocaleDateString()}</span>
                        {alert.status === "open" && (
                          <Button variant="outline" size="sm">
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {complianceAlerts.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">No compliance alerts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                  <CardDescription>Key metrics and growth indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">Monthly Growth</p>
                          <p className="text-2xl font-bold">{analytics?.monthly_growth || 0}%</p>
                        </div>
                      </div>
                      <Badge variant="default">+{analytics?.monthly_growth || 0}%</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">Platform Revenue</p>
                          <p className="text-2xl font-bold">${analytics?.total_revenue?.toLocaleString() || "0"}</p>
                        </div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>PUFF Token Metrics</CardTitle>
                  <CardDescription>Token supply and circulation data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Coins className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">Total Supply</p>
                          <p className="text-2xl font-bold">{analytics?.total_puff_supply?.toLocaleString() || "0"}</p>
                        </div>
                      </div>
                      <Badge variant="default">Fixed</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Wallet className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">Circulating Supply</p>
                          <p className="text-2xl font-bold">{analytics?.circulating_puff?.toLocaleString() || "0"}</p>
                        </div>
                      </div>
                      <Badge variant="default">
                        {analytics?.total_puff_supply && analytics?.circulating_puff
                          ? Math.round((analytics.circulating_puff / analytics.total_puff_supply) * 100)
                          : 0}
                        %
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Merchant Application Review Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Merchant Application</DialogTitle>
              <DialogDescription>
                {selectedApplication.business_name} - {selectedApplication.owner_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Business Name</Label>
                  <p className="text-sm">{selectedApplication.business_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Owner Name</Label>
                  <p className="text-sm">{selectedApplication.owner_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedApplication.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm">{selectedApplication.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">License Number</Label>
                  <p className="text-sm">{selectedApplication.license_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Application Date</Label>
                  <p className="text-sm">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Documents</Label>
                <div className="mt-2 space-y-2">
                  {selectedApplication.documents.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApplication.status === "pending" && (
                <div className="flex space-x-4">
                  <Button onClick={() => handleMerchantApproval(selectedApplication.id, true)} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleMerchantApproval(selectedApplication.id, false)}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Withdrawal Review Dialog */}
      {selectedWithdrawal && (
        <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review Withdrawal Request</DialogTitle>
              <DialogDescription>
                {selectedWithdrawal.merchant_name} - ${selectedWithdrawal.amount.toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Withdrawal Amount</span>
                  <span className="font-bold">${selectedWithdrawal.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Processing Fee (2.5%)</span>
                  <span className="font-medium">${selectedWithdrawal.processing_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-muted-foreground">Net Payout</span>
                  <span className="font-bold">
                    ${(selectedWithdrawal.amount - selectedWithdrawal.processing_fee).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Merchant</Label>
                <p className="text-sm">{selectedWithdrawal.merchant_name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Requested Date</Label>
                <p className="text-sm">{new Date(selectedWithdrawal.requested_at).toLocaleDateString()}</p>
              </div>

              <div>
                <Label htmlFor="withdrawal-notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="withdrawal-notes"
                  placeholder="Add notes about this withdrawal..."
                  value={withdrawalNotes}
                  onChange={(e) => setWithdrawalNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {selectedWithdrawal.status === "pending" && (
                <div className="flex space-x-4">
                  <Button onClick={() => handleWithdrawalApproval(selectedWithdrawal.id, true)} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleWithdrawalApproval(selectedWithdrawal.id, false)}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
