"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, XCircle, Loader2, ExternalLink, Copy, AlertTriangle, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface Transaction {
  id: string
  hash?: string
  status: "pending" | "confirmed" | "failed" | "settling"
  amount: number
  currency: string
  from?: string
  to?: string
  timestamp: string
  confirmations?: number
  requiredConfirmations?: number
  gasUsed?: number
  gasFee?: number
  blockNumber?: number
}

interface TransactionStatusTrackerProps {
  transaction: Transaction
  onRefresh?: () => void
  showDetails?: boolean
}

export function TransactionStatusTracker({
  transaction,
  onRefresh,
  showDetails = true,
}: TransactionStatusTrackerProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (transaction.status === "pending") {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10))
      }, 1000)
      return () => clearInterval(interval)
    } else if (transaction.status === "confirmed") {
      setProgress(100)
    } else if (transaction.status === "settling") {
      setProgress(75)
    }
  }, [transaction.status])

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "confirmed":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "pending":
        return <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
      case "settling":
        return <TrendingUp className="w-6 h-6 text-blue-600" />
      case "failed":
        return <XCircle className="w-6 h-6 text-red-600" />
      default:
        return <Clock className="w-6 h-6 text-gray-600" />
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "settling":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusMessage = () => {
    switch (transaction.status) {
      case "confirmed":
        return "Transaction confirmed on blockchain"
      case "pending":
        return "Waiting for blockchain confirmation..."
      case "settling":
        return "Transaction settling..."
      case "failed":
        return "Transaction failed"
      default:
        return "Processing transaction"
    }
  }

  const copyHash = () => {
    if (transaction.hash) {
      navigator.clipboard.writeText(transaction.hash)
      toast.success("Transaction hash copied")
    }
  }

  const viewOnExplorer = () => {
    if (transaction.hash) {
      window.open(`https://etherscan.io/tx/${transaction.hash}`, "_blank")
    }
  }

  const confirmationProgress =
    transaction.confirmations && transaction.requiredConfirmations
      ? (transaction.confirmations / transaction.requiredConfirmations) * 100
      : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Transaction Status</CardTitle>
              <CardDescription>{getStatusMessage()}</CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor()}>{transaction.status.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {(transaction.status === "pending" || transaction.status === "settling") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Confirmations */}
        {transaction.confirmations !== undefined && transaction.requiredConfirmations && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confirmations</span>
              <span className="font-medium">
                {transaction.confirmations} / {transaction.requiredConfirmations}
              </span>
            </div>
            <Progress value={confirmationProgress} className="h-2" />
          </div>
        )}

        {/* Transaction Details */}
        {showDetails && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-bold text-primary">
                {transaction.amount} {transaction.currency}
              </span>
            </div>

            {transaction.hash && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Transaction Hash:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-background px-2 py-1 rounded flex-1 truncate">
                    {transaction.hash}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copyHash}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {transaction.blockNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Block:</span>
                <span className="font-medium">#{transaction.blockNumber.toLocaleString()}</span>
              </div>
            )}

            {transaction.gasFee && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Fee:</span>
                <span className="font-medium">${transaction.gasFee.toFixed(4)}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Time:</span>
              <span className="font-medium">{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onRefresh && transaction.status === "pending" && (
            <Button variant="outline" onClick={onRefresh} className="flex-1 bg-transparent">
              <Loader2 className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          )}
          {transaction.hash && (
            <Button variant="outline" onClick={viewOnExplorer} className="flex-1 bg-transparent">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          )}
        </div>

        {/* Status-specific messages */}
        {transaction.status === "failed" && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Transaction Failed</p>
              <p className="text-xs mt-1">The transaction was rejected by the network. Please try again.</p>
            </div>
          </div>
        )}

        {transaction.status === "confirmed" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="text-sm text-green-700">
              <p className="font-medium">Transaction Successful</p>
              <p className="text-xs mt-1">Your transaction has been confirmed on the blockchain.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
