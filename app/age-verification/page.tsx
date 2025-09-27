"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AgeVerificationPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()

  const handleVerification = async (isOver21: boolean) => {
    setIsVerifying(true)

    if (isOver21) {
      // Set age verification cookie
      document.cookie = "age-verified=true; path=/; max-age=86400" // 24 hours
      router.push("/")
    } else {
      // Redirect to external site for underage users
      window.location.href = "https://www.samhsa.gov/find-help/national-helpline"
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">Age Verification Required</CardTitle>
          <CardDescription className="text-slate-600">
            You must be 21 or older to access cannabis products
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-500">
              By entering this site, you certify that you are at least 21 years of age and agree to our terms of
              service.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => handleVerification(true)}
                disabled={isVerifying}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                I am 21 or older
              </Button>

              <Button
                onClick={() => handleVerification(false)}
                disabled={isVerifying}
                variant="outline"
                className="w-full"
              >
                I am under 21
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
