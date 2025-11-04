"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react"

interface Transfer {
  guid: string
  transfer_type: string
  asset: string
  amount: number
  state: string
  created_at: string
  source_account_guid?: string
  destination_account_guid?: string
}

interface TransferHistoryProps {
  customerId: string
}

export function CybridTransferHistory({ customerId }: TransferHistoryProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await fetch(`/api/cybrid/transfers?customerId=${customerId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch transfers")
        }
        const data = await response.json()
        setTransfers(data.transfers || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchTransfers()
  }, [customerId])

  const getStatusColor = (state: string) => {
    switch (state) {
      case "completed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">{error}</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer History</CardTitle>
        <CardDescription>View your recent transfers</CardDescription>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transfers yet</p>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <div key={transfer.guid} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-muted">
                    {transfer.transfer_type === "funding" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transfer.transfer_type === "funding" ? "Funding" : "Book Transfer"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transfer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {(transfer.amount / 100).toFixed(2)} {transfer.asset}
                  </p>
                  <Badge className={getStatusColor(transfer.state)}>{transfer.state}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
