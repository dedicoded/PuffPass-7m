import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

async function getVaultBalance() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/fund-vault`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) return { balanceUsdc: 0 }
  return res.json()
}

async function getRecentRedemptions() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/redeem-history`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) return { redemptions: [] }
  return res.json()
}

export default async function VaultDashboard() {
  const { balanceUsdc } = await getVaultBalance()
  const { redemptions } = await getRecentRedemptions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Puff Vault Dashboard</h1>
        <p className="text-gray-600">Monitor and manage PUFF token redemptions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vault Balance</CardTitle>
            <CardDescription>USDC available for redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 mb-4">${balanceUsdc?.toFixed(2) || "0.00"}</div>
            <p className="text-sm text-gray-600">Funded by merchant withdrawal fees (7% instant, 5% delayed)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fund Vault</CardTitle>
            <CardDescription>Add USDC to enable redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/admin/fund-vault" method="POST" className="space-y-4">
              <Input type="number" name="amountUsdc" placeholder="Amount in USDC" min="1" step="0.01" />
              <Button type="submit" className="w-full">
                Fund Vault
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Redemptions</CardTitle>
          <CardDescription>Last 50 PUFF → USDC conversions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-right p-2">PUFF Redeemed</th>
                  <th className="text-right p-2">USDC Sent</th>
                  <th className="text-right p-2">Date</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      No redemptions yet
                    </td>
                  </tr>
                ) : (
                  redemptions.map((r: any) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-sm">
                        {r.user_wallet.slice(0, 6)}...{r.user_wallet.slice(-4)}
                      </td>
                      <td className="text-right p-2">{r.puff_amount}</td>
                      <td className="text-right p-2 font-semibold">${(r.usdc_amount / 1e6).toFixed(2)}</td>
                      <td className="text-right p-2 text-sm text-gray-600">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            r.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
