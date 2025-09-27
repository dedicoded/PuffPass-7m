import { ShoppingCart, Building2, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 text-balance">🍃MyCora Cannabis Platform</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto text-pretty">
            Choose your role to access cannabis commerce features
          </p>
          <p className="text-lg text-slate-500 font-medium">
            Enterprise-grade security with 90% savings over credit cards
          </p>
        </div>

        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Cannabis Customer */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <ShoppingCart className="w-12 h-12 text-green-600" />
              <h2 className="text-2xl font-bold text-slate-800">Cannabis Customer</h2>
              <p className="text-slate-600 text-lg">
                Shop cannabis products with Puff Pass rewards and mobile payments
              </p>

              <div className="grid md:grid-cols-2 gap-4 w-full mt-6">
                <div className="text-left space-y-2">
                  <p className="text-slate-700">One-tap mobile payments</p>
                  <p className="text-slate-700">QR code product scanning</p>
                </div>
                <div className="text-left space-y-2">
                  <p className="text-slate-700">Puff Points rewards</p>
                  <p className="text-slate-700">Purchase history & receipts</p>
                </div>
              </div>

              <a
                href="/login?role=customer"
                className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-6 inline-block text-center"
              >
                Select Cannabis Customer
              </a>
            </div>
          </div>

          {/* Cannabis Merchant */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Building2 className="w-12 h-12 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-800">Cannabis Merchant</h2>
              <p className="text-slate-600 text-lg">
                Manage your dispensary with inventory tracking and compliance tools
              </p>

              <div className="grid md:grid-cols-2 gap-4 w-full mt-6">
                <div className="text-left space-y-2">
                  <p className="text-slate-700">Real-time inventory management</p>
                  <p className="text-slate-700">Payment QR code generation</p>
                </div>
                <div className="text-left space-y-2">
                  <p className="text-slate-700">METRC compliance tracking</p>
                  <p className="text-slate-700">Sales analytics dashboard</p>
                </div>
              </div>

              <a
                href="/login?role=merchant"
                className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-6 inline-block text-center"
              >
                Select Cannabis Merchant
              </a>
            </div>
          </div>

          {/* Platform Admin */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Shield className="w-12 h-12 text-purple-600" />
              <h2 className="text-2xl font-bold text-slate-800">Platform Admin</h2>
              <p className="text-slate-600 text-lg">Oversee merchant operations with trustee approval workflows</p>

              <div className="grid md:grid-cols-2 gap-4 w-full mt-6">
                <div className="text-left space-y-2">
                  <p className="text-slate-700">Merchant approval workflows</p>
                  <p className="text-slate-700">Compliance monitoring</p>
                </div>
                <div className="text-left space-y-2">
                  <p className="text-slate-700">Payout management</p>
                  <p className="text-slate-700">Platform analytics</p>
                </div>
              </div>

              <a
                href="/login?role=admin"
                className="w-full max-w-md bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-6 inline-block text-center"
              >
                Select Platform Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
