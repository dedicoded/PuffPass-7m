"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseUnits } from "viem"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const REDEMPTION_ABI = [
  {
    name: "redeem",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "puffAmount", type: "uint256" }],
    outputs: [],
  },
] as const

export default function RedeemPage() {
  const { address, isConnected } = useAccount()
  const [puffAmount, setPuffAmount] = useState("100")
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const usdcAmount = (Number.parseInt(puffAmount) / 100).toFixed(2)

  const handleRedeem = async () => {
    if (!address || !isConnected) {
      setErrorMessage("Please connect your wallet")
      setStatus("error")
      return
    }

    try {
      setStatus("pending")
      setErrorMessage("")

      const amount = parseUnits(puffAmount, 18)

      console.log("[v0] Redeeming", puffAmount, "PUFF for", usdcAmount, "USDC")

      writeContract({
        address: process.env.NEXT_PUBLIC_REDEMPTION_CONTRACT as `0x${string}`,
        abi: REDEMPTION_ABI,
        functionName: "redeem",
        args: [amount],
      })

      setStatus("success")
    } catch (error: any) {
      console.error("[v0] Redemption error:", error)
      setErrorMessage(error.message || "Redemption failed")
      setStatus("error")
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>Please connect your wallet to redeem PUFF tokens</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isConfirming) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p>Confirming redemption...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-2">Redemption Successful!</h2>
              <p className="text-gray-600 mb-4">
                You redeemed {puffAmount} PUFF for ${usdcAmount} USDC
              </p>
              <Button onClick={() => setStatus("idle")}>Redeem More</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Redeem PuffPass Tokens</CardTitle>
          <CardDescription>Convert your PUFF tokens to USDC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-center text-lg font-semibold text-purple-900">100 PUFF = $1 USDC</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PUFF Amount</label>
            <Input
              type="number"
              min="100"
              step="100"
              value={puffAmount}
              onChange={(e) => setPuffAmount(e.target.value)}
              placeholder="100"
            />
            <p className="text-sm text-gray-500">Minimum: 100 PUFF (must be multiple of 100)</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">You will receive:</span>
              <span className="text-2xl font-bold text-green-600">${usdcAmount}</span>
            </div>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleRedeem}
            disabled={!address || status === "pending" || Number.parseInt(puffAmount) < 100}
            className="w-full"
            size="lg"
          >
            {status === "pending" ? "Processing..." : `Redeem ${puffAmount} PUFF`}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Redemptions are funded by the Puff Vault from merchant withdrawal fees
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
