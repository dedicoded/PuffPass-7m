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
  const { useAccount, useConnect, useDisconnect, useSignMessage } = hooks
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const router = useRouter()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    if (isConnected && address && !isAuthenticating) {
      handleAuthentication(address)
    }
  }, [isConnected, address])

  const handleAuthentication = async (walletAddress: string) => {
    try {
      setIsAuthenticating(true)
      console.log("[v0] Starting wallet authentication for:", walletAddress)

      const message = `Puff Pass Login - ${Date.now()}`

      let signature: string
      try {
        signature = await signMessageAsync({ message })
        console.log("[v0] Message signed successfully")
      } catch (signError: any) {
        console.error("[v0] Signature error:", signError)

        if (signError.message?.includes("User rejected") || signError.message?.includes("denied")) {
          throw new Error("Signature request was denied. Please approve the signature in your wallet to continue.")
        } else if (signError.message?.includes("not authorized")) {
          throw new Error("Wallet not authorized. Please ensure your wallet is unlocked and connected.")
        } else {
          throw new Error(`Failed to sign message: ${signError.message || "Unknown error"}`)
        }
      }

      console.log("[v0] Message signed, calling login API")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType: "wallet",
          walletAddress,
          signature,
          message,
          userType: "consumer",
        }),
        credentials: "include", // Ensure cookies are included in request
      })

      console.log("[v0] Login API response status:", response.status)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unexpected response format from server")
      }

      const data = await response.json()
      console.log("[v0] Login response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      if (data.success && data.redirectTo) {
        toast.success("Successfully logged in!")
        console.log("[v0] Navigating to:", data.redirectTo)

        console.log("[v0] Waiting 500ms for cookie to be set...")
        await new Promise((resolve) => setTimeout(resolve, 500))

        const hasCookie = document.cookie.includes("session=")
        console.log("[v0] Session cookie present:", hasCookie)

        if (!hasCookie) {
          console.warn("[v0] Session cookie not found, waiting additional 500ms...")
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        console.log("[v0] Executing navigation to:", data.redirectTo)
        window.location.href = data.redirectTo
        return
      }

      throw new Error("Invalid response from server")
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
