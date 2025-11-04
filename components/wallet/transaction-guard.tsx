"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { validateTransactionSignature } from "@/lib/transaction-nonce-manager"
import { BLOCKCHAIN_CONFIG } from "@/lib/blockchain-config"

interface TransactionGuardProps {
  transaction?: any
  onApprove?: () => void
  onReject?: () => void
  children?: React.ReactNode
}

export function TransactionGuard({ transaction, onApprove, onReject, children }: TransactionGuardProps) {
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (transaction) {
      checkTransaction()
    }
  }, [transaction])

  const checkTransaction = async () => {
    setIsChecking(true)
    try {
      // Validate transaction signature and replay protection
      const result = validateTransactionSignature(transaction, BLOCKCHAIN_CONFIG.currentChainId)
      setValidationResult(result)

      if (!result.valid) {
        console.warn("[v0] Transaction validation failed:", result.error)
      }
    } catch (error: any) {
      console.error("[v0] Transaction check error:", error)
      setValidationResult({ valid: false, error: error.message })
    } finally {
      setIsChecking(false)
    }
  }

  if (!transaction) {
    return <>{children}</>
  }

  if (isChecking) {
    return (
      <Alert>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <AlertTitle>Validating Transaction</AlertTitle>
        <AlertDescription>Checking transaction security and replay protection...</AlertDescription>
      </Alert>
    )
  }

  if (validationResult && !validationResult.valid) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertTitle>Transaction Security Warning</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{validationResult.error}</p>
          <p className="text-sm">This transaction may be invalid or could be a replay attack. Do not proceed.</p>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={onReject}>
              Reject Transaction
            </Button>
            <Button variant="ghost" size="sm" onClick={checkTransaction}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Recheck
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (validationResult && validationResult.valid) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <AlertTitle className="text-green-900">Transaction Validated</AlertTitle>
        <AlertDescription className="text-green-700 space-y-3">
          <p>This transaction has passed security checks and is protected against replay attacks.</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={onApprove} className="bg-green-600 hover:bg-green-700">
              <Shield className="w-3 h-3 mr-1" />
              Approve Transaction
            </Button>
            <Button variant="outline" size="sm" onClick={onReject}>
              Cancel
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
