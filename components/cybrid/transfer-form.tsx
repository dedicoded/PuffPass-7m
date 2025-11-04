"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"

interface TransferFormProps {
  customerId: string
  sourceAccountGuid?: string
  onSuccess?: (transferId: string) => void
}

export function CybridTransferForm({ customerId, sourceAccountGuid, onSuccess }: TransferFormProps) {
  const [amount, setAmount] = useState("")
  const [asset, setAsset] = useState("USD")
  const [transferType, setTransferType] = useState<"internal" | "external">("internal")
  const [destinationAccountGuid, setDestinationAccountGuid] = useState("")
  const [externalBankAccountGuid, setExternalBankAccountGuid] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/cybrid/create-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          amount: Number.parseFloat(amount),
          asset,
          sourceAccountGuid,
          destinationAccountGuid: transferType === "internal" ? destinationAccountGuid : undefined,
          externalBankAccountGuid: transferType === "external" ? externalBankAccountGuid : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || "Failed to create transfer")
      }

      const result = await response.json()
      setSuccess(true)
      setAmount("")
      setDestinationAccountGuid("")
      setExternalBankAccountGuid("")

      if (onSuccess) {
        onSuccess(result.transferId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Transfer</CardTitle>
        <CardDescription>Transfer funds between accounts or to external banks</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-type">Transfer Type</Label>
            <Select value={transferType} onValueChange={(value: any) => setTransferType(value)}>
              <SelectTrigger id="transfer-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal (Between Accounts)</SelectItem>
                <SelectItem value="external">External (To Bank Account)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset">Asset</Label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger id="asset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transferType === "internal" && (
            <div className="space-y-2">
              <Label htmlFor="destination">Destination Account GUID</Label>
              <Input
                id="destination"
                placeholder="Enter destination account GUID"
                value={destinationAccountGuid}
                onChange={(e) => setDestinationAccountGuid(e.target.value)}
                required
              />
            </div>
          )}

          {transferType === "external" && (
            <div className="space-y-2">
              <Label htmlFor="external-bank">External Bank Account GUID</Label>
              <Input
                id="external-bank"
                placeholder="Enter external bank account GUID"
                value={externalBankAccountGuid}
                onChange={(e) => setExternalBankAccountGuid(e.target.value)}
                required
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Transfer created successfully!</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Transfer...
              </>
            ) : (
              <>
                Create Transfer
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
