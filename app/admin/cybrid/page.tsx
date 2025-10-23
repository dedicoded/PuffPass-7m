"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Wallet, Fuel, Receipt, RefreshCw, ExternalLink } from "lucide-react"

interface CybridAccount {
  guid: string
  type: string
  asset: string
  balance: string
  available: string
  state: string
  created_at: string
  updated_at: string
}

interface AccountsData {
  success: boolean
  accounts: CybridAccount[]
  configured: {
    reserve: string
    gas: string
    fee: string
  }
  bank: {
    guid: string
    name: string
  }
}

export default function CybridAccountsPage() {
  const [data, setData] = useState<AccountsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/cybrid/accounts")
      if (!response.ok) {
        throw new Error("Failed to fetch accounts")
      }
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "reserve":
        return <Wallet className="w-5 h-5" />
      case "gas":
        return <Fuel className="w-5 h-5" />
      case "fee":
        return <Receipt className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const getAccountColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "reserve":
        return "bg-blue-500/10 text-blue-500"
      case "gas":
        return "bg-orange-500/10 text-orange-500"
      case "fee":
        return "bg-green-500/10 text-green-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Accounts</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAccounts} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cybrid Accounts</h1>
          <p className="text-muted-foreground">Manage your PuffCash banking accounts on Cybrid</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAccounts} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://dashboard.cybrid.app/banks/${data?.bank.guid}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Dashboard
          </Button>
        </div>
      </div>

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Bank Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="font-medium">{data.bank.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank GUID:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">{data.bank.guid}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Accounts:</span>
                <span className="font-medium">{data.accounts.length}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            {data.accounts.map((account) => (
              <Card key={account.guid} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${getAccountColor(account.type)}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${getAccountColor(account.type)}`}>
                      {getAccountIcon(account.type)}
                    </div>
                    <Badge variant={account.state === "created" ? "default" : "secondary"}>{account.state}</Badge>
                  </div>
                  <CardTitle className="capitalize">{account.type} Account</CardTitle>
                  <CardDescription className="font-mono text-xs">{account.guid}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Balance</div>
                    <div className="text-2xl font-bold">${(Number.parseFloat(account.balance) / 100).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{account.asset}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Available</div>
                    <div className="text-lg font-semibold">
                      ${(Number.parseFloat(account.available) / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="pt-4 border-t space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(account.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{new Date(account.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configured Account GUIDs</CardTitle>
              <CardDescription>These accounts are configured in your environment variables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Reserve Account</span>
                </div>
                <code className="text-sm">{data.configured.reserve}</code>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Fuel className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Gas Account</span>
                </div>
                <code className="text-sm">{data.configured.gas}</code>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Fee Account</span>
                </div>
                <code className="text-sm">{data.configured.fee}</code>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
