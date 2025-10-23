import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExternalLink, Key, AlertCircle, CheckCircle2 } from "lucide-react"

export default function CybridCredentialsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cybrid API Credentials</h1>
        <p className="text-muted-foreground">Manage your Cybrid Bank API Key credentials for PuffCash</p>
      </div>

      <Alert className="mb-6 border-amber-500 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <strong>Authentication Failed:</strong> Your current Bank API Key credentials are being rejected by Cybrid
          with error "invalid_client". You need to generate new credentials.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Generate New Bank API Key
          </CardTitle>
          <CardDescription>Follow these steps to create new credentials in the Cybrid Partner Portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Go to Cybrid Partner Portal</p>
                <p className="text-sm text-muted-foreground">Navigate to your PuffCash bank in the Cybrid dashboard</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Navigate to Developers → API Keys</p>
                <p className="text-sm text-muted-foreground">Click on the "Developers" section in the left sidebar</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Click "Generate Bank Key"</p>
                <p className="text-sm text-muted-foreground">
                  This will create a new Bank-level API Key for customer operations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                4
              </div>
              <div>
                <p className="font-medium">Copy Both Credentials Immediately</p>
                <p className="text-sm text-muted-foreground">
                  Save the Client ID and Client Secret - the secret won't be shown again!
                </p>
              </div>
            </div>
          </div>

          <Button className="w-full" asChild>
            <a
              href="https://bank.sandbox.cybrid.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              Open Cybrid Partner Portal
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Credentials in Code</CardTitle>
          <CardDescription>After generating new credentials, update them in your configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Current Configuration Location:</p>
              <code className="block bg-muted p-3 rounded text-sm">lib/cybrid-config.ts</code>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Update these values:</p>
              <div className="bg-muted p-3 rounded text-sm space-y-2">
                <div>
                  <span className="text-muted-foreground">clientId:</span>{" "}
                  <span className="text-amber-600">"YOUR_NEW_CLIENT_ID"</span>
                </div>
                <div>
                  <span className="text-muted-foreground">clientSecret:</span>{" "}
                  <span className="text-amber-600">"YOUR_NEW_CLIENT_SECRET"</span>
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                For production deployment, add these as environment variables in Vercel:
                <code className="block mt-2 text-xs">CYBRID_CLIENT_ID</code>
                <code className="block text-xs">CYBRID_CLIENT_SECRET</code>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Current Bank Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-blue-700 font-medium">Bank Name:</span>
            <span className="text-blue-900">PuffCash</span>

            <span className="text-blue-700 font-medium">Bank GUID:</span>
            <span className="text-blue-900 font-mono text-xs">2a28078007155bdecf9f237834f3decd</span>

            <span className="text-blue-700 font-medium">Organization GUID:</span>
            <span className="text-blue-900 font-mono text-xs">059526698b52ef3827e417f794da7bfe</span>

            <span className="text-blue-700 font-medium">Environment:</span>
            <span className="text-blue-900">Sandbox</span>

            <span className="text-blue-700 font-medium">Supported Assets:</span>
            <span className="text-blue-900">USD</span>

            <span className="text-blue-700 font-medium">Trading Symbols:</span>
            <span className="text-blue-900">BTC-USD, ETH-USD, USDC-USD, SOL-USD, +13 more</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
