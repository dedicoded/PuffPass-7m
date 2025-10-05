"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { WalletConnectButton } from "./wallet-connect-button"
import { PasskeyLogin } from "./passkey-login"
import { EmailPasswordLogin } from "./email-password-login"
import { AdminLogin } from "./admin-login"
import { Home } from "lucide-react"
import Link from "next/link"

interface LoginSelectorProps {
  userType: "consumer" | "merchant" | "admin"
  onSuccess: (user: any) => void
}

export function LoginSelector({ userType, onSuccess }: LoginSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLoginSuccess = (user: any) => {
    console.log("[v0] LoginSelector - handleLoginSuccess called")
    console.log("[v0] LoginSelector - Full user object:", JSON.stringify(user, null, 2))
    console.log("[v0] LoginSelector - User role:", user?.role)
    console.log("[v0] LoginSelector - User role type:", typeof user?.role)

    setIsLoading(false)

    onSuccess(user)

    setTimeout(() => {
      console.log("[v0] LoginSelector - Starting redirect for role:", user?.role)

      const role = user?.role?.toLowerCase()

      if (role === "customer") {
        console.log("[v0] LoginSelector - Redirecting to /customer")
        router.push("/customer")
      } else if (role === "merchant") {
        console.log("[v0] LoginSelector - Redirecting to /merchant")
        router.push("/merchant")
      } else if (role === "admin") {
        console.log("[v0] LoginSelector - Redirecting to /admin")
        router.push("/admin")
      } else {
        console.log("[v0] LoginSelector - No matching role, redirecting to /dashboard")
        router.push("/dashboard")
      }
    }, 100)
  }

  const handleLoginError = (error: string) => {
    setIsLoading(false)
    console.error("[v0] LoginSelector - Login error:", error)
  }

  if (userType === "admin") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Trustee Access</CardTitle>
          <CardDescription>Restricted to deployer wallet only</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-between items-center mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>
        <CardTitle className="text-2xl font-bold">
          {userType === "consumer" ? "Welcome to Puff Pass" : "Merchant Login"}
        </CardTitle>
        <CardDescription>
          {userType === "consumer" ? "Choose your preferred login method" : "Access your merchant dashboard"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4">
            <WalletConnectButton
              userType={userType}
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            {userType === "consumer" && (
              <p className="text-sm text-muted-foreground text-center">
                No wallet? We'll create one for you automatically
              </p>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Tabs defaultValue="passkey" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="passkey">Passkey</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>

              <TabsContent value="passkey">
                <PasskeyLogin
                  userType={userType}
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </TabsContent>

              <TabsContent value="password">
                <EmailPasswordLogin
                  userType={userType}
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
