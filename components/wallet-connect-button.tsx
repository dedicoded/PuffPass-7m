"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, CheckCircle, Copy, Contact as Disconnect, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface WalletConnectButtonProps {
  onConnect?: (walletId: string, address: string) => void
  onDisconnect?: () => void
  showBalance?: boolean
}

export function WalletConnectButton({ onConnect, onDisconnect, showBalance = false }: WalletConnectButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [web3Available, setWeb3Available] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connector, setConnector] = useState<any>(null)

  useEffect(() => {
    setMounted(true)

    const checkWeb3Availability = async () => {
      try {
        // Check if wagmi hooks are available
        const { useAccount, useDisconnect, useWeb3Modal } = await import("wagmi")
        const { useWeb3Modal: useModal } = await import("@web3modal/wagmi/react")

        setWeb3Available(true)

        // If available, set up the hooks
        const { useAccount: useAccountHook, useDisconnect: useDisconnectHook } = await import("wagmi")
        const { useWeb3Modal: useWeb3ModalHook } = await import("@web3modal/wagmi/react")

        // Note: In a real implementation, you'd use these hooks directly
        // This is a simplified version for error handling
      } catch (error) {
        console.warn("[v0] Web3 functionality not available:", error)
        setWeb3Available(false)
      }
    }

    checkWeb3Availability()
  }, [])

  const handleConnect = () => {
    if (!web3Available) {
      toast.error("Web3 functionality is not available in this browser")
      return
    }

    try {
      // In a real implementation, this would call open() from useWeb3Modal
      toast.info("Web3 connection would open here")
    } catch (error) {
      console.error("[v0] Failed to open Web3 modal:", error)
      toast.error("Failed to open wallet connection")
    }
  }

  const handleDisconnect = () => {
    try {
      // In a real implementation, this would call disconnect()
      setIsConnected(false)
      setAddress(null)
      setConnector(null)
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

  if (!mounted) {
    return (
      <Button disabled className="w-full" size="lg">
        <Wallet className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (!web3Available) {
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
            <div className="flex space-x-2">
              <Button
                onClick={handleConnect}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900 bg-transparent"
              >
                Switch
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900 bg-transparent"
              >
                <Disconnect className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Button onClick={handleConnect} className="w-full" size="lg">
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  )
}
