import { Suspense } from "react"
import { TrusteeHeader } from "@/components/trustee/trustee-header"
import { VaultSnapshot } from "@/components/trustee/vault-snapshot"
import { YieldForecast } from "@/components/trustee/yield-forecast"
import { AllocationControls } from "@/components/trustee/allocation-controls"
import { TreasuryAlerts } from "@/components/trustee/treasury-alerts"
import { SecurityDashboard } from "@/components/admin/security-dashboard"
import { TrusteeWalletGuard } from "@/components/admin/trustee-wallet-guard"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function TrusteePage() {
  return (
    <TrusteeWalletGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <TrusteeHeader />

          <Suspense fallback={<LoadingSkeleton />}>
            <Tabs defaultValue="treasury" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="treasury">Treasury Management</TabsTrigger>
                <TabsTrigger value="security">Security Dashboard</TabsTrigger>
              </TabsList>

              <TabsContent value="treasury" className="space-y-8">
                {/* Vault Overview */}
                <VaultSnapshot />

                {/* Main Dashboard Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                    <YieldForecast />
                    <AllocationControls />
                  </div>

                  <div className="space-y-6">
                    <TreasuryAlerts />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <SecurityDashboard />
              </TabsContent>
            </Tabs>
          </Suspense>
        </div>
      </div>
    </TrusteeWalletGuard>
  )
}
