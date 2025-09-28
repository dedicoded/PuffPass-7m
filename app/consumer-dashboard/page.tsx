"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import {
  Wallet,
  Send,
  QrCode,
  Plus,
  ArrowDownLeft,
  Gift,
  Shield,
  Zap,
  TrendingUp,
  LogOut,
  CheckCircle,
  Sparkles,
  Heart,
} from "lucide-react"

interface Transaction {
  id: string
  type: "payment" | "transfer" | "onramp" | "reward"
  amount: number
  puff_amount?: number
  description: string
  merchant_name?: string
  recipient?: string
  created_at: string
  status: "completed" | "pending" | "failed"
  fee_covered: boolean
}

export default function ConsumerDashboard() {
  const [puffBalance, setPuffBalance] = useState(127.45)
  const [puffPoints, setPuffPoints] = useState(350)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [merchantUsername, setMerchantUsername] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [recipientUsername, setRecipientUsername] = useState("")

  useEffect(() => {
    fetchTransactions()
    fetchBalance()
  }, [])

  const fetchTransactions = async () => {
    try {
      // Mock data with fee-free emphasis
      setTransactions([
        {
          id: "1",
          type: "payment",
          amount: 45.99,
          puff_amount: -45.99,
          description: "Green Valley Dispensary",
          merchant_name: "Green Valley",
          created_at: "2024-01-15T14:30:00Z",
          status: "completed",
          fee_covered: true,
        },
        {
          id: "2",
          type: "transfer",
          amount: 20.0,
          puff_amount: -20.0,
          description: "Sent to @greenqueen420",
          recipient: "greenqueen420",
          created_at: "2024-01-14T16:20:00Z",
          status: "completed",
          fee_covered: true,
        },
        {
          id: "3",
          type: "onramp",
          amount: 100.0,
          puff_amount: 100.0,
          description: "Added funds via Apple Pay",
          created_at: "2024-01-14T10:15:00Z",
          status: "completed",
          fee_covered: false,
        },
        {
          id: "4",
          type: "reward",
          amount: 0,
          puff_amount: 5.0,
          description: "Achievement bonus: Loyal Customer",
          created_at: "2024-01-13T12:00:00Z",
          status: "completed",
          fee_covered: false,
        },
      ])
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBalance = async () => {
    try {
      // Mock balance fetch
      setPuffBalance(127.45)
      setPuffPoints(350)
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    }
  }

  const handlePayment = async () => {
    const amount = Number.parseFloat(paymentAmount)
    if (!amount || amount <= 0 || !merchantUsername) {
      alert("Please enter valid payment details")
      return
    }

    if (amount > puffBalance) {
      alert("Insufficient balance")
      return
    }

    // Mock payment processing
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "payment",
      amount: amount,
      puff_amount: -amount,
      description: `Payment to @${merchantUsername}`,
      merchant_name: merchantUsername,
      created_at: new Date().toISOString(),
      status: "completed",
      fee_covered: true,
    }

    setTransactions((prev) => [newTransaction, ...prev])
    setPuffBalance((prev) => prev - amount)
    setPaymentAmount("")
    setMerchantUsername("")
    setIsPayModalOpen(false)

    // Show success message
    alert(`Payment sent! $${amount.toFixed(2)} sent to @${merchantUsername} - no fees applied!`)
  }

  const handleTransfer = async () => {
    const amount = Number.parseFloat(transferAmount)
    if (!amount || amount <= 0 || !recipientUsername) {
      alert("Please enter valid transfer details")
      return
    }

    if (amount > puffBalance) {
      alert("Insufficient balance")
      return
    }

    // Mock transfer processing
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "transfer",
      amount: amount,
      puff_amount: -amount,
      description: `Sent to @${recipientUsername}`,
      recipient: recipientUsername,
      created_at: new Date().toISOString(),
      status: "completed",
      fee_covered: true,
    }

    setTransactions((prev) => [newTransaction, ...prev])
    setPuffBalance((prev) => prev - amount)
    setTransferAmount("")
    setRecipientUsername("")
    setIsTransferModalOpen(false)

    // Show success message
    alert(`Transfer complete! $${amount.toFixed(2)} sent to @${recipientUsername} - no fees applied!`)
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your Puff Pass wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">🍃 PuffPass</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Your Wallet
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-lg border border-primary/20">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="font-bold text-foreground">₱ {puffBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-chart-2/10 to-chart-2/5 px-3 py-2 rounded-lg border border-chart-2/20">
                  <Gift className="w-4 h-4 text-[var(--chart-2)]" />
                  <span className="font-medium text-foreground">{puffPoints}</span>
                </div>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-3xl font-bold text-foreground">Welcome back! 👋</h2>
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <Shield className="w-3 h-3 mr-1" />
              Verified Wallet
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">Your Puff Pass wallet is ready for fee-free payments.</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-border/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pay">Pay & Transfer</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">PUFF Balance</p>
                        <p className="text-3xl font-bold text-foreground">₱ {puffBalance.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Fee-Free Payments
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-background border-chart-2/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-[var(--chart-2)]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Puff Points</p>
                        <p className="text-3xl font-bold text-foreground">{puffPoints}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Earn points with every purchase</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-3/10 via-chart-3/5 to-background border-chart-3/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-chart-3/10 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-[var(--chart-3)]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Saved in Fees</p>
                        <p className="text-3xl font-bold text-foreground">$23.40</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">This month with Puff Pass</p>
                </CardContent>
              </Card>
            </div>

            {/* Fee-Free Messaging */}
            <Card className="bg-gradient-to-r from-primary/5 via-background to-chart-2/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">Your payments are always fee-free!</h3>
                    <p className="text-muted-foreground">
                      Merchants cover all fees so you can pay without worrying about extra charges. Powered by the Puff
                      Vault treasury system.
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2">
                    <Heart className="w-4 h-4 mr-2" />
                    Fee-Free Zone
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Send payments and transfers instantly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-20 flex-col space-y-2 bg-gradient-to-r from-primary to-primary/90">
                        <QrCode className="w-6 h-6" />
                        <span>Pay Merchant</span>
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-20 flex-col space-y-2 bg-gradient-to-r from-chart-2/10 to-chart-2/5 border-chart-2/20"
                      >
                        <Send className="w-6 h-6" />
                        <span>Send to Friend</span>
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 bg-gradient-to-r from-chart-3/10 to-chart-3/5 border-chart-3/20"
                    asChild
                  >
                    <a href="/onramp">
                      <Plus className="w-6 h-6" />
                      <span>Add Funds</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest transactions</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.querySelector('[value="activity"]')?.click()}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "payment"
                              ? "bg-primary/10 text-primary"
                              : transaction.type === "transfer"
                                ? "bg-chart-2/10 text-[var(--chart-2)]"
                                : transaction.type === "onramp"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {transaction.type === "payment" ? (
                            <QrCode className="w-5 h-5" />
                          ) : transaction.type === "transfer" ? (
                            <Send className="w-5 h-5" />
                          ) : transaction.type === "onramp" ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : (
                            <Gift className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                            {transaction.fee_covered && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                Fee-Free
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transaction.puff_amount && transaction.puff_amount > 0
                              ? "text-green-600"
                              : "text-foreground"
                          }`}
                        >
                          {transaction.puff_amount && transaction.puff_amount > 0 ? "+" : ""}₱{" "}
                          {Math.abs(transaction.puff_amount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pay & Transfer Tab */}
          <TabsContent value="pay" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    <span>Pay a Merchant</span>
                  </CardTitle>
                  <CardDescription>Send fee-free payments to dispensaries and businesses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="merchant">Merchant Username or QR Code</Label>
                    <Input
                      id="merchant"
                      placeholder="@dispensary420 or scan QR"
                      value={merchantUsername}
                      onChange={(e) => setMerchantUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pay-amount">Amount (₱)</Label>
                    <Input
                      id="pay-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">✨ No fees applied — merchant covers the cost</p>
                  </div>
                  <Button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-primary to-primary/90"
                    disabled={!paymentAmount || !merchantUsername}
                  >
                    Send Payment
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-[var(--chart-2)]" />
                    <span>Send to Friend</span>
                  </CardTitle>
                  <CardDescription>Transfer PUFF to other users instantly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient Username</Label>
                    <Input
                      id="recipient"
                      placeholder="@friend420"
                      value={recipientUsername}
                      onChange={(e) => setRecipientUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transfer-amount">Amount (₱)</Label>
                    <Input
                      id="transfer-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">✨ No fees applied — transfers are always free</p>
                  </div>
                  <Button
                    onClick={handleTransfer}
                    className="w-full bg-gradient-to-r from-chart-2 to-chart-2/90"
                    disabled={!transferAmount || !recipientUsername}
                  >
                    Send Transfer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All your Puff Pass activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.type === "payment"
                              ? "bg-primary/10 text-primary"
                              : transaction.type === "transfer"
                                ? "bg-chart-2/10 text-[var(--chart-2)]"
                                : transaction.type === "onramp"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {transaction.type === "payment" ? (
                            <QrCode className="w-6 h-6" />
                          ) : transaction.type === "transfer" ? (
                            <Send className="w-6 h-6" />
                          ) : transaction.type === "onramp" ? (
                            <ArrowDownLeft className="w-6 h-6" />
                          ) : (
                            <Gift className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{transaction.description}</p>
                          <div className="flex items-center space-x-3">
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                              {new Date(transaction.created_at).toLocaleTimeString()}
                            </p>
                            {transaction.fee_covered && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Fee-Free
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            transaction.puff_amount && transaction.puff_amount > 0
                              ? "text-green-600"
                              : "text-foreground"
                          }`}
                        >
                          {transaction.puff_amount && transaction.puff_amount > 0 ? "+" : ""}₱{" "}
                          {Math.abs(transaction.puff_amount || 0).toFixed(2)}
                        </p>
                        <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card className="bg-gradient-to-r from-chart-2/10 via-background to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-full flex items-center justify-center">
                    <Gift className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{puffPoints} Puff Points</h3>
                    <p className="text-muted-foreground">
                      Earn points with every purchase and unlock exclusive rewards
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Next reward at</p>
                    <p className="text-xl font-bold text-primary">500 points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Rewards</CardTitle>
                  <CardDescription>Redeem your points for exclusive perks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">$5 PUFF Credit</h4>
                      <Badge variant="outline">100 points</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Add $5 to your wallet balance</p>
                    <Button size="sm" disabled={puffPoints < 100}>
                      {puffPoints >= 100 ? "Redeem" : "Need 100 points"}
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Premium Delivery</h4>
                      <Badge variant="outline">250 points</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Free same-day delivery on next order</p>
                    <Button size="sm" disabled={puffPoints < 250}>
                      {puffPoints >= 250 ? "Redeem" : "Need 250 points"}
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">VIP Access</h4>
                      <Badge variant="outline">500 points</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Early access to new products</p>
                    <Button size="sm" disabled={puffPoints < 500}>
                      {puffPoints >= 500 ? "Redeem" : "Need 500 points"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How to Earn Points</CardTitle>
                  <CardDescription>Multiple ways to boost your rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                    <QrCode className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium">Make Purchases</p>
                      <p className="text-sm text-muted-foreground">1 point per $1 spent</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-chart-2/5 rounded-lg">
                    <Send className="w-6 h-6 text-[var(--chart-2)]" />
                    <div>
                      <p className="font-medium">Refer Friends</p>
                      <p className="text-sm text-muted-foreground">50 points per referral</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-chart-3/5 rounded-lg">
                    <Gift className="w-6 h-6 text-[var(--chart-3)]" />
                    <div>
                      <p className="font-medium">Daily Check-in</p>
                      <p className="text-sm text-muted-foreground">5 points per day</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-chart-4/5 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-[var(--chart-4)]" />
                    <div>
                      <p className="font-medium">Achievements</p>
                      <p className="text-sm text-muted-foreground">Bonus points for milestones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay a Merchant</DialogTitle>
          <DialogDescription>Send a fee-free payment to any Puff Pass merchant</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="modal-merchant">Merchant Username</Label>
            <Input
              id="modal-merchant"
              placeholder="@dispensary420"
              value={merchantUsername}
              onChange={(e) => setMerchantUsername(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="modal-amount">Amount (₱)</Label>
            <Input
              id="modal-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium text-center">
              ✨ You're sending ${paymentAmount || "0.00"} — no fees applied.
              <br />
              Merchant covers the cost.
            </p>
          </div>
          <Button onClick={handlePayment} className="w-full" disabled={!paymentAmount || !merchantUsername}>
            Send Payment
          </Button>
        </div>
      </DialogContent>

      {/* Transfer Modal */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send to Friend</DialogTitle>
          <DialogDescription>Transfer PUFF to another user instantly</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="modal-recipient">Recipient Username</Label>
            <Input
              id="modal-recipient"
              placeholder="@friend420"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="modal-transfer-amount">Amount (₱)</Label>
            <Input
              id="modal-transfer-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium text-center">
              ✨ You're sending ${transferAmount || "0.00"} to @{recipientUsername || "friend"} — no fees applied.
            </p>
          </div>
          <Button onClick={handleTransfer} className="w-full" disabled={!transferAmount || !recipientUsername}>
            Send Transfer
          </Button>
        </div>
      </DialogContent>
    </div>
  )
}
