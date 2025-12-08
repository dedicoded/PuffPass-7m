"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface TreasuryStats {
  totalRevenue: string
  dailyRevenue: string
  activeMerchants: number
  totalTransactions: number
  contractBalance: string
  treasuryBalance: string
}

interface Transaction {
  id: string
  merchant: string
  amount: string
  fee: string
  timestamp: string
  type: "payment" | "withdrawal"
}

export function TreasuryDashboard() {
  const [stats, setStats] = useState<TreasuryStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [timeRange, setTimeRange] = useState<string>("24h")
  const [account, setAccount] = useState<string>("")

  useEffect(() => {
    connectWallet()
  }, [])

  useEffect(() => {
    if (account) {
      loadTreasuryData()
    }
  }, [account, timeRange])

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccount(accounts[0])
      } catch (err) {
        setError("Failed to connect wallet")
      }
    }
  }

  const loadTreasuryData = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/treasury-stats?range=${timeRange}`)
      if (!response.ok) {
        throw new Error("Failed to load treasury data")
      }

      const data = await response.json()
      setStats(data.stats)
      setTransactions(data.transactions)
    } catch (err: any) {
      setError(err.message || "Failed to load treasury data")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: string) => {
    return Number.parseFloat(amount).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    })
  }

  if (!account) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Access Required</CardTitle>
          <CardDescription>Please connect your admin wallet to access the treasury dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet} className="w-full">
            Connect Admin Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">PuffPass Treasury Dashboard</h1>
        <p className="text-muted-foreground">Admin wallet: {account}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats?.totalRevenue || "0")}</p>
                <p className="text-sm text-muted-foreground">All-time earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">Daily Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats?.dailyRevenue || "0")}</p>
                <p className="text-sm text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">Active Merchants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{stats?.activeMerchants || 0}</p>
                <p className="text-sm text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{stats?.totalTransactions || 0}</p>
                <p className="text-sm text-muted-foreground">All time</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <div className="mt-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left text-sm font-medium">Transaction</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Merchant</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Amount</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Fee</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b">
                        <td className="px-4 py-2 text-sm">{tx.id}</td>
                        <td className="px-4 py-2 text-sm font-mono text-xs">{tx.merchant}</td>
                        <td className="px-4 py-2 text-sm">${tx.amount}</td>
                        <td className="px-4 py-2 text-sm">${tx.fee}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              tx.type === "payment" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">{new Date(tx.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
