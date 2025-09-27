"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, CheckCircle, Copy, Contact as Disconnect } from "lucide-react"
import { useAccount, useDisconnect } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { toast } from "sonner"

interface WalletConnectButtonProps {
  onConnect?: (walletId: string, address: string) => void
  onDisconnect?: () => void
  showBalance?: boolean
}

export function WalletConnectButton({ onConnect, onDisconnect, showBalance = false }: WalletConnectButtonProps) {
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isConnected && address && onConnect) {
      onConnect(connector?.name || "unknown", address)
    }
  }, [isConnected, address, connector, onConnect])

  const handleConnect = () => {
    open()
  }

  const handleDisconnect = () => {
    disconnect()
    onDisconnect?.()
    toast.success("Wallet disconnected")
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
