"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react"
import { BLOCKCHAIN_CONFIG, validateBlockchainConfig } from "@/lib/blockchain-config"
import { useWeb3Health } from "@/components/web3-provider"

export function BlockchainStatus() {
  const web3Health = useWeb3Health()
  const [configValidation, setConfigValidation] = useState<{ valid: boolean; errors: string[] }>({
    valid: true,
    errors: [],
  })

  useEffect(() => {
    setConfigValidation(validateBlockchainConfig())
  }, [])

  const getStatusIcon = () => {
    if (!BLOCKCHAIN_CONFIG.isRealBlockchain) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    }
    if (web3Health?.isHealthy) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    return <XCircle className="w-4 h-4 text-red-600" />
  }

  const getStatusText = () => {
    if (!BLOCKCHAIN_CONFIG.isRealBlockchain) {
      return "Simulation Mode"
    }
    if (web3Health?.isHealthy) {
      return "Connected"
    }
    return "Disconnected"
  }

  const getStatusColor = () => {
    if (!BLOCKCHAIN_CONFIG.isRealBlockchain) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    }
    if (web3Health?.isHealthy) {
      return "bg-green-100 text-green-800 border-green-300"
    }
    return "bg-red-100 text-red-800 border-red-300"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Blockchain Status</CardTitle>
          <Badge className={getStatusColor()}>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </Badge>
        </div>
        <CardDescription>Current blockchain configuration and connection status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Network</p>
            <p className="font-medium capitalize">{BLOCKCHAIN_CONFIG.network}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Chain ID</p>
            <p className="font-medium">{BLOCKCHAIN_CONFIG.currentChainId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mode</p>
            <p className="font-medium">{BLOCKCHAIN_CONFIG.isRealBlockchain ? "Real Blockchain" : "Simulation"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Environment</p>
            <p className="font-medium capitalize">
              {BLOCKCHAIN_CONFIG.features.testMode ? "Development" : "Production"}
            </p>
          </div>
        </div>

        {BLOCKCHAIN_CONFIG.currentExplorer && (
          <a
            href={BLOCKCHAIN_CONFIG.currentExplorer}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            View on Block Explorer
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {!configValidation.valid && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Configuration Issues:</p>
              <ul className="list-disc list-inside space-y-1">
                {configValidation.errors.map((error, i) => (
                  <li key={i} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {!BLOCKCHAIN_CONFIG.isRealBlockchain && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">Simulation Mode Active</p>
              <p className="text-sm mt-1">
                Transactions are simulated. To enable real blockchain transactions, see{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">docs/TESTNET_SETUP.md</code>
              </p>
            </AlertDescription>
          </Alert>
        )}

        {web3Health?.isDemo && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">Demo WalletConnect ID</p>
              <p className="text-sm mt-1">
                Using demo project ID. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for production.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
