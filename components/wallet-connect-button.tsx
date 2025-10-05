"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, CheckCircle, Copy, LogOut, AlertTriangle, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface WalletConnectButtonProps {
  onConnect?: (walletId: string, address: string) => void
  onDisconnect?: () => void
  showBalance?: boolean
  autoLogin?: boolean
}

export function WalletConnectButton({
  onConnect,
  onDisconnect,
  showBalance = false,
  autoLogin = false,
}: WalletConnectButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [web3Available, setWeb3Available] = useState(false)
  const [hooks, setHooks] = useState<any>(null)

  useEffect(() => {
    setMounted(true)

    const loadWeb3 = async () => {
      try {
        const wagmi = await import("wagmi")
        setHooks(wagmi)
        setWeb3Available(true)
      } catch (error) {
        console.warn("[v0] Web3 functionality not available:", error)
        setWeb3Available(false)
      }
    }

    loadWeb3()
  }, [])

  if (!mounted) {
    return (
      <Button disabled size="lg">
        <Wallet className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (!web3Available || !hooks) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Web3 Unavailable</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Wallet connection is not available in this browser environment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <WalletConnectButtonInner hooks={hooks} onConnect={onConnect} onDisconnect={onDisconnect} autoLogin={autoLogin} />
  )
}

function WalletConnectButtonInner({
  hooks,
  onConnect,
  onDisconnect,
  autoLogin = false,
}: {
  hooks: any
  onConnect?: (walletId: string, address: string) => void
  onDisconnect?: () => void
  autoLogin?: boolean
}) {
  const { useAccount, useConnect, useDisconnect } = hooks
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    if (autoLogin && isConnected && address && !isAuthenticating) {
      handleAuthentication(address)
    }
  }, [autoLogin, isConnected, address])

  const handleAuthentication = async (walletAddress: string) => {
    try {
      setIsAuthenticating(true)
      console.log("[v0] Starting wallet authentication for:", walletAddress)

      if (!window.ethereum) {
        throw new Error("MetaMask or compatible wallet not detected")
      }

      // Sign message to verify wallet ownership
      const message = `Puff Pass Login - ${Date.now()}`
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      })

      console.log("[v0] Message signed, calling login API")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType: "wallet",
          walletAddress,
          signature,
          message,
          userType: "consumer", // Default to consumer, can be changed based on context
        }),
      })

      let data
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        // If response is not JSON, try to get text and create error object
        const text = await response.text()
        console.error("[v0] Non-JSON error response:", text)
        data = {
          success: false,
          error: text || "Server error occurred",
        }
      }

      console.log("[v0] Wallet authentication response:", data)

      if (data.success) {
        toast.success("Successfully logged in!")
        // Redirect based on user role
        if (data.user?.role === "admin") {
          router.push("/admin")
        } else if (data.user?.role === "merchant") {
          router.push("/merchant")
        } else {
          router.push("/consumer")
        }
      } else {
        throw new Error(data.error || "Wallet authentication failed")
      }
    } catch (err: any) {
      console.error("[v0] Wallet authentication error:", err)
      toast.error(err.message || "Failed to authenticate wallet")
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleConnect = (connector: any) => {
    try {
      connect({ connector })
      if (address) {
        onConnect?.(connector.id, address)
        toast.success(`Connected to ${connector.name}`)
      }
    } catch (error) {
      console.error("[v0] Failed to connect wallet:", error)
      toast.error("Failed to connect wallet")
    }
  }

  const handleDisconnect = () => {
    try {
      disconnect()
      onDisconnect?.()
      toast.success("Wallet disconnected")
    } catch (error) {
      console.error("[v0] Failed to disconnect wallet:", error)
      toast.error("Failed to disconnect wallet")
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success("Address copied to clipboard")
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isAuthenticating) {
    return (
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200">Authenticating...</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Please sign the message in your wallet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isConnected && address) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    {connector?.name || "Wallet"} Connected
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-green-700 dark:text-green-300 font-mono">{formatAddress(address)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900 bg-transparent"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg" disabled={isPending}>
          <Wallet className="w-4 h-4 mr-2" />
          {isPending ? "Connecting..." : "Connect Wallet"}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {connectors.map((connector) => (
          <DropdownMenuItem key={connector.id} onClick={() => handleConnect(connector)} className="cursor-pointer">
            <Wallet className="w-4 h-4 mr-2" />
            {connector.name}
          </DropdownMenuItem>
        ))}
        {connectors.length === 0 && (
          <DropdownMenuItem disabled>
            <AlertTriangle className="w-4 h-4 mr-2" />
            No wallets available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
