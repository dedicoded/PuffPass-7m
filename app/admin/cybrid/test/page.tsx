"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, Copy, ExternalLink } from "lucide-react"

export default function CybridCredentialTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const testCredentials = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/cybrid/auth/token")
      const data = await response.json()

      if (response.ok && data.access_token) {
        setResult({
          success: true,
          message: "Credentials are valid! Authentication successful.",
          details: {
            tokenType: data.token_type,
            expiresIn: data.expires_in,
            scope: data.scope,
          },
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Authentication failed",
          details: data,
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: "Failed to test credentials",
        details: { error: error.message },
      })
    } finally {
      setTesting(false)
    }
  }

  const curlCommand = `curl -X POST https://id.sandbox.cybrid.app/oauth/token \\
  -H "Authorization: Basic $(echo -n 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' | base64)" \\
  -H "Content-Type: application/json" \\
  -d '{"grant_type":"client_credentials","scope":"banks:read customers:read customers:write accounts:read quotes:execute trades:execute"}'`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cybrid Credential Tester</h1>
        <p className="text-muted-foreground">Test your Cybrid API credentials to diagnose authentication issues</p>
      </div>

      <div className="grid gap-6">
        {/* Test Button */}
        <Card>
          <CardHeader>
            <CardTitle>Test Authentication</CardTitle>
            <CardDescription>Click the button below to test if your Cybrid credentials are valid</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testCredentials} disabled={testing} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Credentials"
              )}
            </Button>

            {result && (
              <Alert className={`mt-4 ${result.success ? "border-green-500" : "border-red-500"}`}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription className="font-medium">{result.message}</AlertDescription>
                    {result.details && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Manual Test with curl */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Test with curl</CardTitle>
            <CardDescription>
              Test your credentials directly with curl to verify they work outside the app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded text-xs overflow-auto">{curlCommand}</pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(curlCommand)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Replace <code>YOUR_CLIENT_ID</code> and <code>YOUR_CLIENT_SECRET</code> with your actual credentials from
              the Cybrid dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Troubleshooting Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Verify Credentials in Cybrid Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Go to{" "}
                <a
                  href="https://id.sandbox.cybrid.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Cybrid Sandbox Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>{" "}
                and verify your Bank API Key credentials are correct.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">2. Check Environment Variables</h3>
              <p className="text-sm text-muted-foreground">
                Ensure <code>CYBRID_CLIENT_ID</code> and <code>CYBRID_CLIENT_SECRET</code> are set in your Vercel
                environment variables.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">3. Regenerate Credentials</h3>
              <p className="text-sm text-muted-foreground">
                If credentials were deleted or rotated, generate new Bank API Key credentials in the Cybrid dashboard.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">4. Verify Sandbox vs Production</h3>
              <p className="text-sm text-muted-foreground">
                Make sure you're using sandbox credentials for the sandbox environment (not production credentials).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
