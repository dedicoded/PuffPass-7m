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

const POLYGON_USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"
const PUFFPASS_ROUTER = process.env.NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS || ""
const PUFFPASS_TREASURY =
  process.env.NEXT_PUBLIC_PUFFPASS_TREASURY_ADDRESS || "0x0000000000000000000000000000000000000000"

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
  const [usdcBalance, setUsdcBalance] = useState<string>("0")

  const effectiveRecipient =
    merchantAddress && merchantAddress !== "0x0000000000000000000000000000000000000000"
      ? merchantAddress
      : PUFFPASS_TREASURY

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    console.log("[v0] Checking wallet connection...")
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        const provider = new BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const address = await accounts[0].getAddress()
          setWalletAddress(address)
          const network = await provider.getNetwork()
          setNetworkName(network.name)
          console.log("[v0] Wallet already connected:", address, "Network:", network.name)

          await fetchUsdcBalance(provider, address)
        }
      } catch (err) {
        console.error("[v0] Failed to check connection:", err)
      }
    } else {
      console.log("[v0] No ethereum provider found")
    }
  }

  const fetchUsdcBalance = async (provider: any, address: string) => {
    try {
      const usdc = new Contract(POLYGON_USDC, USDC_ABI, provider)
      const balance = await usdc.balanceOf(address)
      const formattedBalance = ethers.formatUnits(balance, 6)
      setUsdcBalance(formattedBalance)
      console.log("[v0] USDC balance:", formattedBalance)
    } catch (err) {
      console.error("[v0] Failed to fetch USDC balance:", err)
    }
  }

  const connectWallet = async () => {
    console.log("[v0] Connecting wallet...")
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
      console.log("[v0] Connected wallet:", address)

      const network = await provider.getNetwork()
      setNetworkName(network.name)
      console.log("[v0] Network:", network.name, "Chain ID:", network.chainId)

      if (network.chainId !== 137n) {
        console.log("[v0] Switching to Polygon network...")
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x89" }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            console.log("[v0] Adding Polygon network...")
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

      await fetchUsdcBalance(provider, address)

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
    console.log("[v0] Starting payment process...")
    console.log("[v0] Amount:", amount, "Recipient:", effectiveRecipient)
    console.log("[v0] Router address:", PUFFPASS_ROUTER)

    if (!walletAddress) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!PUFFPASS_ROUTER) {
      console.error("[v0] PuffPassRouter address not configured")
      setError("Payment system not configured. Please contact support.")
      toast.error("Payment system not configured. The PuffPassRouter contract address is missing.")
      return
    }

    if (!effectiveRecipient || effectiveRecipient === "0x0000000000000000000000000000000000000000") {
      console.error("[v0] No valid recipient address")
      setError("No valid recipient address configured")
      toast.error("Payment recipient not configured. Please try again later.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const amountInUSDC = parseUnits(amount, 6)
      console.log("[v0] Amount in USDC (6 decimals):", amountInUSDC.toString())

      const usdc = new Contract(POLYGON_USDC, USDC_ABI, signer)
      const balance = await usdc.balanceOf(walletAddress)
      console.log("[v0] Current USDC balance:", ethers.formatUnits(balance, 6))

      if (balance < amountInUSDC) {
        throw new Error(
          `Insufficient USDC balance. You have ${ethers.formatUnits(balance, 6)} USDC but need ${amount} USDC`,
        )
      }

      setStatus("approving")
      const currentAllowance = await usdc.allowance(walletAddress, PUFFPASS_ROUTER)
      console.log("[v0] Current allowance:", ethers.formatUnits(currentAllowance, 6))

      if (currentAllowance < amountInUSDC) {
        console.log("[v0] Approving USDC spending...")
        const approveTx = await usdc.approve(PUFFPASS_ROUTER, amountInUSDC)
        console.log("[v0] Approval tx hash:", approveTx.hash)
        await approveTx.wait()
        toast.success("USDC spending approved!")
        console.log("[v0] Approval confirmed")
      }

      setStatus("paying")
      const router = new Contract(PUFFPASS_ROUTER, ROUTER_ABI, signer)

      console.log("[v0] Processing payment via PuffPassRouter...")
      console.log("[v0] Calling router.pay(", effectiveRecipient, ",", amountInUSDC.toString(), ")")
      const payTx = await router.pay(effectiveRecipient, amountInUSDC)
      console.log("[v0] Payment tx hash:", payTx.hash)
      const receipt = await payTx.wait()
      console.log("[v0] Payment confirmed in block:", receipt.blockNumber)

      setTxHash(receipt.hash)
      setStatus("success")
      toast.success("Payment successful!")

      try {
        console.log("[v0] Recording payment in database...")
        await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            amount: Number.parseFloat(amount),
            merchantAddress: effectiveRecipient,
            txHash: receipt.hash,
            network: "polygon",
            description,
          }),
        })
        console.log("[v0] Payment recorded successfully")
      } catch (dbErr) {
        console.error("[v0] Failed to record payment in database:", dbErr)
        // Don't fail the payment if DB recording fails
      }

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

  const isConfigured = !!PUFFPASS_ROUTER && effectiveRecipient !== "0x0000000000000000000000000000000000000000"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with USDC on Polygon</CardTitle>
        <CardDescription>Fast, low-cost payments powered by PuffPassRouter</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfigured && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Payment System Not Configured</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {!PUFFPASS_ROUTER && "Missing NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS. "}
                  {effectiveRecipient === "0x0000000000000000000000000000000000000000" && "Missing recipient address."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-primary">Polygon USDC Payments</p>
              <p className="text-muted-foreground text-xs mt-1">
                Fast confirmations (~5 seconds) with minimal gas fees (~$0.01)
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">USDC Balance:</span>
                <Badge variant="outline" className="font-mono">
                  ${Number(usdcBalance).toFixed(2)}
                </Badge>
              </div>
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

            <Button
              onClick={processPayment}
              disabled={loading || status === "success" || !isConfigured}
              className="w-full"
              size="lg"
            >
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
