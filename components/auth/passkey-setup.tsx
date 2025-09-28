"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fingerprint, Shield, Smartphone, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface PasskeySetupProps {
  userId: string
  onSetupComplete?: () => void
}

export function PasskeySetup({ userId, onSetupComplete }: PasskeySetupProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [hasPasskey, setHasPasskey] = useState(false)

  const registerPasskey = async () => {
    if (!window.PublicKeyCredential) {
      toast.error("Passkeys are not supported on this device")
      return
    }

    setIsRegistering(true)

    try {
      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

      if (!available) {
        toast.error("No biometric authenticator found on this device")
        return
      }

      // Generate challenge from server
      const challengeResponse = await fetch("/api/auth/passkey/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!challengeResponse.ok) {
        throw new Error("Failed to get challenge")
      }

      const { challenge, user } = await challengeResponse.json()

      // Create credential
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(challenge),
          rp: {
            name: "PUFF PASS",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(user.id),
            name: user.email,
            displayName: user.name,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: true,
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential

      if (!credential) {
        throw new Error("Failed to create credential")
      }

      // Register credential with server
      const registrationResponse = await fetch("/api/auth/passkey/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          credentialId: credential.id,
          publicKey: Array.from(new Uint8Array(credential.response.publicKey!)),
          deviceType: "platform",
        }),
      })

      if (!registrationResponse.ok) {
        throw new Error("Failed to register passkey")
      }

      setHasPasskey(true)
      toast.success("Passkey registered successfully!")
      onSetupComplete?.()
    } catch (error) {
      console.error("Passkey registration error:", error)
      toast.error("Failed to register passkey. Please try again.")
    } finally {
      setIsRegistering(false)
    }
  }

  if (hasPasskey) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">Passkey Active</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your device is now registered for secure biometric login
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Secured
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Fingerprint className="w-5 h-5 text-primary" />
          <CardTitle>Setup Passkey Authentication</CardTitle>
        </div>
        <CardDescription>
          Enable secure, passwordless login using your device's biometric authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-sm">Enhanced Security</p>
              <p className="text-xs text-muted-foreground">Biometric verification</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <Smartphone className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-sm">Device Bound</p>
              <p className="text-xs text-muted-foreground">Tied to this device</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-sm">No Passwords</p>
              <p className="text-xs text-muted-foreground">Passwordless login</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">Requirements</p>
              <ul className="text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                <li>• Device with biometric authentication (Face ID, Touch ID, or fingerprint)</li>
                <li>• Modern browser with WebAuthn support</li>
                <li>• This device will be registered for your account</li>
              </ul>
            </div>
          </div>
        </div>

        <Button onClick={registerPasskey} disabled={isRegistering} className="w-full" size="lg">
          <Fingerprint className="w-4 h-4 mr-2" />
          {isRegistering ? "Setting up Passkey..." : "Setup Passkey"}
        </Button>
      </CardContent>
    </Card>
  )
}
