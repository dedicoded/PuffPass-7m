"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Send, Users } from "lucide-react"
import { toast } from "sonner"

interface Recipient {
  id: string
  address: string
  amount: number
  memo?: string
}

interface BatchTransactionBuilderProps {
  currency?: string
  onExecute?: (recipients: Recipient[], totalAmount: number) => Promise<void>
}

export function BatchTransactionBuilder({ currency = "USDC", onExecute }: BatchTransactionBuilderProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([{ id: "1", address: "", amount: 0 }])
  const [isExecuting, setIsExecuting] = useState(false)

  const addRecipient = () => {
    const newId = (recipients.length + 1).toString()
    setRecipients([...recipients, { id: newId, address: "", amount: 0 }])
  }

  const removeRecipient = (id: string) => {
    if (recipients.length === 1) {
      toast.error("At least one recipient is required")
      return
    }
    setRecipients(recipients.filter((r) => r.id !== id))
  }

  const updateRecipient = (id: string, field: keyof Recipient, value: any) => {
    setRecipients(recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const validateRecipients = (): boolean => {
    for (const recipient of recipients) {
      if (!recipient.address || recipient.address.length < 10) {
        toast.error("All recipients must have valid addresses")
        return false
      }
      if (recipient.amount <= 0) {
        toast.error("All amounts must be greater than 0")
        return false
      }
    }
    return true
  }

  const executeBatchTransaction = async () => {
    if (!validateRecipients()) return

    setIsExecuting(true)
    try {
      const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0)

      if (onExecute) {
        await onExecute(recipients, totalAmount)
        toast.success("Batch transaction executed successfully!")
        // Reset form
        setRecipients([{ id: "1", address: "", amount: 0 }])
      }
    } catch (error: any) {
      console.error("Batch transaction error:", error)
      toast.error(error.message || "Failed to execute batch transaction")
    } finally {
      setIsExecuting(false)
    }
  }

  const totalAmount = recipients.reduce((sum, r) => sum + (r.amount || 0), 0)
  const validRecipients = recipients.filter((r) => r.address && r.amount > 0).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Batch Transaction Builder
        </CardTitle>
        <CardDescription>Send {currency} to multiple recipients in a single transaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Recipients</p>
            <Badge variant="secondary">
              {validRecipients} / {recipients.length}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
            <p className="font-bold text-primary">
              {totalAmount.toFixed(2)} {currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Est. Gas Savings</p>
            <Badge variant="default" className="bg-green-600">
              ~{Math.max(0, (recipients.length - 1) * 30)}%
            </Badge>
          </div>
        </div>

        {/* Recipients List */}
        <div className="space-y-3">
          {recipients.map((recipient, index) => (
            <Card key={recipient.id} className="border-muted">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <Label className="text-sm font-medium">Recipient {index + 1}</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`address-${recipient.id}`} className="text-xs">
                        Wallet Address
                      </Label>
                      <Input
                        id={`address-${recipient.id}`}
                        placeholder="0x..."
                        value={recipient.address}
                        onChange={(e) => updateRecipient(recipient.id, "address", e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${recipient.id}`} className="text-xs">
                          Amount ({currency})
                        </Label>
                        <Input
                          id={`amount-${recipient.id}`}
                          type="number"
                          placeholder="0.00"
                          value={recipient.amount || ""}
                          onChange={(e) =>
                            updateRecipient(recipient.id, "amount", Number.parseFloat(e.target.value) || 0)
                          }
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`memo-${recipient.id}`} className="text-xs">
                          Memo (Optional)
                        </Label>
                        <Input
                          id={`memo-${recipient.id}`}
                          placeholder="Payment for..."
                          value={recipient.memo || ""}
                          onChange={(e) => updateRecipient(recipient.id, "memo", e.target.value)}
                          maxLength={50}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRecipient(recipient.id)}
                    disabled={recipients.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={addRecipient} className="flex-1 bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add Recipient
          </Button>
          <Button onClick={executeBatchTransaction} disabled={isExecuting || validRecipients === 0} className="flex-1">
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {validRecipients} Recipient{validRecipients !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
          <p className="font-medium">Batch Transaction Benefits:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Save up to 70% on gas fees compared to individual transactions</li>
            <li>All transfers execute atomically (all succeed or all fail)</li>
            <li>Single approval required for multiple recipients</li>
            <li>Faster execution than sequential transactions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
