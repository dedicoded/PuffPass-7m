"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WalletConnectButton } from "./wallet-connect-button"
import { Wallet, Copy, Star, Plus, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { useWeb3Health } from "@/components/web3-provider"

interface WalletData {
  id: number
  wallet_address: string
  currency: string
  network: string
  is_primary: boolean
  created_at: string
}

interface WalletDashboardProps {
  userId: string
}

export function WalletDashboard({ userId }: WalletDashboardProps) {
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(true)

  const web3Health = useWeb3Health()
  const isWeb3Available = web3Health?.isHealthy || false

  const [address, setAddress] = useState<string | undefined>(undefined)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (isWeb3Available) {
      const loadWagmiData = async () => {
        try {
          const { useAccount } = await import("wagmi")
          // Note: This is a simplified approach - in production you'd use the hook directly
          // For now, we'll just set default values
        } catch (error) {
          console.warn("[v0] Failed to load wagmi hooks:", error)
        }
      }
      loadWagmiData()
    }
  }, [isWeb3Available])

  useEffect(() => {
    fetchWallets()
  }, [userId])

  const fetchWallets = async () => {
    try {
      const response = await fetch(`/api/wallet/get-wallets?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setWallets(data.wallets)
      }
    } catch (error) {
      console.error("Error fetching wallets:", error)
      toast.error("Failed to load wallets")
    } finally {
      setLoading(false)
    }
  }

  const handleWalletConnect = async (walletId: string, walletAddress: string) => {
    try {
      const response = await fetch("/api/wallet/save-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          walletAddress,
          network: "ethereum",
          isPrimary: wallets.length === 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Wallet connected successfully")
        fetchWallets()
      } else {
        toast.error("Failed to connect wallet")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast.error("Failed to connect wallet")
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Crypto Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading wallets...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isWeb3Available) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Web3 Wallet Connection Unavailable
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Crypto wallet functionality is currently unavailable. This may be due to browser compatibility or
                  network issues.
                  {web3Health?.error && ` (${web3Health.error})`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {wallets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Your Saved Wallets
              </CardTitle>
              <CardDescription>Previously connected wallet addresses (read-only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <Card key={wallet.id} className="border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium font-mono">{formatAddress(wallet.wallet_address)}</p>
                              {wallet.is_primary && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span className="capitalize">{wallet.network}</span>
                              <span>•</span>
                              <span>{wallet.currency}</span>
                              <span>•</span>
                              <span>Added {new Date(wallet.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyAddress(wallet.wallet_address)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Crypto Wallets
          </CardTitle>
          <CardDescription>Connect and manage your cryptocurrency wallets for seamless transactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connect new wallet */}
          <div className="space-y-2">
            <h4 className="font-medium">Connect New Wallet</h4>
            <WalletConnectButton onConnect={handleWalletConnect} showBalance={true} />
          </div>

          {wallets.length > 0 && (
            <>
              <Separator />

              {/* Connected wallets */}
              <div className="space-y-2">
                <h4 className="font-medium">Connected Wallets ({wallets.length})</h4>
                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <Card key={wallet.id} className="border-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium font-mono">{formatAddress(wallet.wallet_address)}</p>
                                {wallet.is_primary && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span className="capitalize">{wallet.network}</span>
                                <span>•</span>
                                <span>{wallet.currency}</span>
                                <span>•</span>
                                <span>Added {new Date(wallet.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => copyAddress(wallet.wallet_address)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {wallets.length === 0 && !isConnected && (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No wallets connected yet.</p>
              <p className="text-sm">Connect your first wallet to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Features */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Features</CardTitle>
          <CardDescription>What you can do with your connected wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium">Fiat-to-Crypto</h4>
                <p className="text-sm text-muted-foreground">Convert USD to cryptocurrency directly to your wallet</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium">Multi-Chain Support</h4>
                <p className="text-sm text-muted-foreground">Support for Ethereum, Polygon, and other networks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
