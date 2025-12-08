"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, XCircle, Wallet, ExternalLink, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { ethers } from "ethers"
const { BrowserProvider, Contract, parseUnits } = ethers

interface PolygonPaymentProps {
  merchantAddress: string
  orderId?: string
  description?: string
  onSuccess?: () => void
  onCancel?: () => void
}

const POLYGON_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const PUFFPASS_ROUTER = process.env.NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS || ""

const ROUTER_ABI = [
  "function pay(address merchant, uint256 amount) external",
  "function merchantVaults(address) external view returns (uint256)",
  "function BASE_FEE_BPS() external view returns (uint256)",
]

const USDC_ABI = [
  "function approve(address spender, uint256 value) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
]

export function PolygonPayment({ merchantAddress, orderId, description, onSuccess, onCancel }: PolygonPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "connecting" | "approving" | "paying" | "success" | "error">("idle")
  const [amount, setAmount] = useState<string>("100")
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [networkName, setNetworkName] = useState<string>("")

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        const provider = new BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const address = await accounts[0].getAddress()
          setWalletAddress(address)
          const network = await provider.getNetwork()
          setNetworkName(network.name)
        }
      } catch (err) {
        console.error("[v0] Failed to check connection:", err)
      }
    }
  }

  const connectWallet = async () => {
    setLoading(true)
    setError("")
    setStatus("connecting")

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask or another Web3 wallet")
      }

      const provider = new BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setWalletAddress(address)

      const network = await provider.getNetwork()
      setNetworkName(network.name)

      if (network.chainId !== 137n) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x89" }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x89",
                  chainName: "Polygon Mainnet",
                  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                  rpcUrls: ["https://polygon-rpc.com"],
                  blockExplorerUrls: ["https://polygonscan.com"],
                },
              ],
            })
          } else {
            throw switchError
          }
        }
      }

      toast.success("Wallet connected successfully!")
      setStatus("idle")
    } catch (err: any) {
      console.error("[v0] Wallet connection error:", err)
      setError(err.message || "Failed to connect wallet")
      toast.error(err.message || "Failed to connect wallet")
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!PUFFPASS_ROUTER) {
      toast.error("PuffPassRouter not configured")
      return
    }

    setLoading(true)
    setError("")

    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const amountInUSDC = parseUnits(amount, 6)

      setStatus("approving")
      const usdc = new Contract(POLYGON_USDC, USDC_ABI, signer)

      const currentAllowance = await usdc.allowance(walletAddress, PUFFPASS_ROUTER)

      if (currentAllowance < amountInUSDC) {
        console.log("[v0] Approving USDC spending...")
        const approveTx = await usdc.approve(PUFFPASS_ROUTER, amountInUSDC)
        await approveTx.wait()
        toast.success("USDC spending approved!")
      }

      setStatus("paying")
      const router = new Contract(PUFFPASS_ROUTER, ROUTER_ABI, signer)

      console.log("[v0] Processing payment via PuffPassRouter...")
      const payTx = await router.pay(merchantAddress, amountInUSDC)
      const receipt = await payTx.wait()

      setTxHash(receipt.hash)
      setStatus("success")
      toast.success("Payment successful!")

      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: Number.parseFloat(amount),
          merchantAddress,
          txHash: receipt.hash,
          network: "polygon",
          description,
        }),
      })

      onSuccess?.()
    } catch (err: any) {
      console.error("[v0] Payment error:", err)
      setError(err.message || "Payment failed")
      toast.error(err.message || "Payment failed")
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  const calculateFee = () => {
    const amt = Number.parseFloat(amount) || 0
    const fee = amt * 0.03
    const net = amt - fee
    return { fee: fee.toFixed(2), net: net.toFixed(2) }
  }

  const { fee, net } = calculateFee()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with USDC on Polygon</CardTitle>
        <CardDescription>Fast, low-cost payments powered by PuffPassRouter</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-primary">System Upgrade</p>
              <p className="text-muted-foreground text-xs mt-1">
                We've upgraded to PuffPassRouter on Polygon for better performance and lower fees!
              </p>
            </div>
          </div>
        </div>

        {!walletAddress ? (
          <>
            <div className="text-center space-y-2 py-4">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Connect your wallet to continue</p>
            </div>
            <Button onClick={connectWallet} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connected:</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </Badge>
              </div>
              {networkName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Network:</span>
                  <Badge variant="outline" className="capitalize">
                    {networkName}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>

            <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${amount || "0.00"} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PuffPass Fee (3%):</span>
                <span className="font-medium">-${fee} USDC</span>
              </div>
              <div className="border-t border-border my-2"></div>
              <div className="flex justify-between">
                <span className="font-medium">Merchant Receives:</span>
                <span className="font-bold text-lg">${net} USDC</span>
              </div>
            </div>

            {status === "success" && txHash && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-success">Payment Confirmed!</p>
                    <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                      <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                        View on PolygonScan <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            <Button onClick={processPayment} disabled={loading || status === "success"} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status === "approving" && "Approving USDC..."}
                  {status === "paying" && "Processing Payment..."}
                  {status === "connecting" && "Connecting..."}
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Payment Complete
                </>
              ) : (
                "Pay with USDC"
              )}
            </Button>

            {onCancel && status !== "success" && (
              <Button onClick={onCancel} variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Merchant receives funds via daily batch settlement (gasless)</p>
              <p>• ~5 second confirmation time on Polygon</p>
              <p>• Low gas fees (~$0.01 per transaction)</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
