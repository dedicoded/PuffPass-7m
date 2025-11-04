"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Network, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { BLOCKCHAIN_CONFIG } from "@/lib/blockchain-config"

interface NetworkSwitcherProps {
  currentChainId?: number
  requiredChainId?: number
  onNetworkSwitch?: () => void
}

export function NetworkSwitcher({ currentChainId, requiredChainId, onNetworkSwitch }: NetworkSwitcherProps) {
  const [isSwitching, setIsSwitching] = useState(false)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)

  const targetChainId = requiredChainId || BLOCKCHAIN_CONFIG.currentChainId

  useEffect(() => {
    if (currentChainId && currentChainId !== targetChainId) {
      setIsWrongNetwork(true)
    } else {
      setIsWrongNetwork(false)
    }
  }, [currentChainId, targetChainId])

  const getNetworkName = (chainId: number): string => {
    const networks: Record<number, string> = {
      1: "Ethereum Mainnet",
      11155111: "Sepolia Testnet",
      137: "Polygon",
      80001: "Mumbai Testnet",
      42161: "Arbitrum One",
      10: "Optimism",
      8453: "Base",
    }
    return networks[chainId] || `Chain ${chainId}`
  }

  const switchNetwork = async () => {
    setIsSwitching(true)
    try {
      if (typeof window.ethereum === "undefined") {
        toast.error("No wallet detected. Please install MetaMask or another Web3 wallet.")
        return
      }

      const chainIdHex = `0x${targetChainId.toString(16)}`

      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        })

        toast.success(`Switched to ${getNetworkName(targetChainId)}`)
        onNetworkSwitch?.()
      } catch (switchError: any) {
        // Network not added to wallet, try to add it
        if (switchError.code === 4902) {
          await addNetwork(targetChainId)
        } else {
          throw switchError
        }
      }
    } catch (error: any) {
      console.error("Network switch error:", error)
      toast.error(error.message || "Failed to switch network")
    } finally {
      setIsSwitching(false)
    }
  }

  const addNetwork = async (chainId: number) => {
    const networkConfigs: Record<number, any> = {
      11155111: {
        chainId: "0xaa36a7",
        chainName: "Sepolia Testnet",
        nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://sepolia.infura.io/v3/"],
        blockExplorerUrls: ["https://sepolia.etherscan.io"],
      },
      137: {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com"],
        blockExplorerUrls: ["https://polygonscan.com"],
      },
      42161: {
        chainId: "0xa4b1",
        chainName: "Arbitrum One",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://arb1.arbitrum.io/rpc"],
        blockExplorerUrls: ["https://arbiscan.io"],
      },
      10: {
        chainId: "0xa",
        chainName: "Optimism",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.optimism.io"],
        blockExplorerUrls: ["https://optimistic.etherscan.io"],
      },
      8453: {
        chainId: "0x2105",
        chainName: "Base",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.base.org"],
        blockExplorerUrls: ["https://basescan.org"],
      },
    }

    const config = networkConfigs[chainId]
    if (!config) {
      throw new Error("Network configuration not found")
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [config],
    })

    toast.success(`Added ${config.chainName} to wallet`)
    onNetworkSwitch?.()
  }

  if (!isWrongNetwork) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">Connected to {getNetworkName(targetChainId)}</p>
              <p className="text-sm text-green-700">You're on the correct network</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Chain {targetChainId}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <div>
            <CardTitle className="text-orange-900">Wrong Network Detected</CardTitle>
            <CardDescription className="text-orange-700">
              Please switch to the correct network to continue
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Network</p>
            <Badge variant="destructive">{currentChainId ? getNetworkName(currentChainId) : "Unknown"}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Required Network</p>
            <Badge variant="default">{getNetworkName(targetChainId)}</Badge>
          </div>
        </div>

        <Alert>
          <Network className="w-4 h-4" />
          <AlertDescription>
            This application requires you to be connected to {getNetworkName(targetChainId)}. Click the button below to
            switch networks automatically.
          </AlertDescription>
        </Alert>

        <Button onClick={switchNetwork} disabled={isSwitching} className="w-full" size="lg">
          {isSwitching ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Switching Network...
            </>
          ) : (
            <>
              <Network className="w-4 h-4 mr-2" />
              Switch to {getNetworkName(targetChainId)}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          If the network is not in your wallet, we'll help you add it automatically.
        </p>
      </CardContent>
    </Card>
  )
}
