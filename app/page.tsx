import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, Coins, Shield, Zap, ArrowRight, Star, Users, TrendingUp, Sparkles, Lock, BarChart3 } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/navigation/site-header"
import { SiteFooter } from "@/components/navigation/site-footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-violet-50 dark:from-emerald-950/20 dark:via-background dark:to-violet-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />

        <div className="container relative mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge
                  variant="secondary"
                  className="w-fit bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Cannabis Payments Platform
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-balance leading-tight">
                  The future of{" "}
                  <span className="bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">
                    cannabis payments
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground text-balance leading-relaxed">
                  Convert fiat to USDC instantly, earn PUFF token rewards, and experience seamless transactions in the
                  cannabis ecosystem. Built for dispensaries, customers, and the future.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="text-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30"
                >
                  <Link href="/onboard">
                    Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg border-2 hover:bg-emerald-50 dark:hover:bg-emerald-950 bg-transparent"
                >
                  <Link href="/onramp">Buy PUFF Tokens</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">
                    10K+
                  </div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">
                    $2M+
                  </div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">
                    500+
                  </div>
                  <div className="text-sm text-muted-foreground">Merchants</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-950 border-2 border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 shadow-2xl shadow-emerald-500/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Coins className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">PUFF Balance</div>
                        <div className="text-sm text-muted-foreground">Available to spend</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">
                        1,247.50
                      </div>
                      <div className="text-sm text-muted-foreground">PUFF</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <span className="text-sm font-medium">Recent Purchase</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+25.00 PUFF</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-violet-100 to-violet-50 dark:from-violet-900/50 dark:to-violet-950/50 border border-violet-200 dark:border-violet-800 rounded-xl">
                      <span className="text-sm font-medium">Rewards Earned</span>
                      <span className="text-sm font-bold text-violet-600 dark:text-violet-400">+12.50 PUFF</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-violet-500 rounded-3xl blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <Badge
              variant="secondary"
              className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 border-0"
            >
              <Star className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-balance">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">
                PuffPass
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
              Experience the most advanced cannabis payment platform with seamless fiat-to-crypto conversion
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 border-2 hover:border-emerald-200 dark:hover:border-emerald-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/30">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Instant Conversions</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Convert fiat to USDC instantly with our advanced payment processing system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 border-2 hover:border-violet-200 dark:hover:border-violet-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-400 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/30">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">PUFF Rewards</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Earn PUFF tokens on every purchase and unlock exclusive benefits in our ecosystem
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Secure & Compliant</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Bank-grade security with full compliance for cannabis industry regulations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 border-2 hover:border-amber-200 dark:hover:border-amber-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-400 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/30">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Multi-Role Platform</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Designed for customers, merchants, and administrators with role-specific features
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 border-2 hover:border-rose-200 dark:hover:border-rose-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-400 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-500/30">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Real-time Analytics</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Track your spending, earnings, and rewards with comprehensive analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 border-2 hover:border-emerald-200 dark:hover:border-emerald-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/30">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Cannabis Focused</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Purpose-built for the cannabis industry with specialized features and compliance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Roles Section */}
      <section id="roles" className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0"
            >
              <Users className="w-4 h-4 mr-2" />
              Choose Your Role
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Access Tailored Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Designed specifically for your needs in the cannabis ecosystem
            </p>
          </div>

          <Tabs defaultValue="customer" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 h-14">
              <TabsTrigger value="customer" className="text-base">
                Customer
              </TabsTrigger>
              <TabsTrigger value="merchant" className="text-base">
                Merchant
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-base">
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="mt-8">
              <Card className="border-2 border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Star className="w-6 h-6 text-emerald-600" />
                    Customer Experience
                  </CardTitle>
                  <CardDescription className="text-base">
                    Shop cannabis products with seamless payments and earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        Payment Features
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>Instant fiat to USDC conversion</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>Multiple payment methods</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>Secure wallet integration</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Coins className="w-5 h-5 text-violet-600" />
                        Rewards & Benefits
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-violet-600 mt-0.5">✓</span>
                          <span>Earn PUFF tokens on purchases</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-violet-600 mt-0.5">✓</span>
                          <span>Loyalty tier progression</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-violet-600 mt-0.5">✓</span>
                          <span>Exclusive member discounts</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
                  >
                    <Link href="/onboard">Start Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="merchant" className="mt-8">
              <Card className="border-2 border-violet-200 dark:border-violet-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Leaf className="w-6 h-6 text-violet-600" />
                    Merchant Dashboard
                  </CardTitle>
                  <CardDescription className="text-base">
                    Manage your cannabis business with powerful tools and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-violet-600" />
                        Business Management
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-violet-600 mt-0.5">✓</span>
                          <span>Product inventory management</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-violet-600 mt-0.5">✓</span>
                          <span>Order processing & fulfillment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-violet-600 mt-0.5">✓</span>
                          <span>Customer relationship tools</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Coins className="w-5 h-5 text-emerald-600" />
                        Payment Processing
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>Accept PUFF token payments</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>Real-time transaction tracking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>Automated compliance reporting</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 shadow-lg"
                  >
                    <Link href="/merchant">Access Merchant Portal</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="mt-8">
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Shield className="w-6 h-6 text-blue-600" />
                    Admin Control Panel
                  </CardTitle>
                  <CardDescription className="text-base">
                    Oversee platform operations with comprehensive administrative tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        Platform Management
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>User & merchant management</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>PUFF token supply control</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>System health monitoring</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-600" />
                        Analytics & Reporting
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>Transaction analytics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>Compliance reporting</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>Revenue tracking</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg"
                  >
                    <Link href="/admin">Access Admin Panel</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-violet-600 border-0 shadow-2xl shadow-emerald-500/30">
            <CardContent className="p-12 text-center space-y-8">
              <h2 className="text-4xl lg:text-6xl font-bold text-white text-balance">Ready to Join PuffPass?</h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto text-balance leading-relaxed">
                Start your journey in the cannabis payment ecosystem today. Convert fiat, earn PUFF tokens, and
                experience the future of cannabis commerce.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="text-lg bg-white text-emerald-600 hover:bg-white/90 shadow-lg"
                >
                  <Link href="/onboard">
                    Create Account <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg border-2 border-white text-white hover:bg-white/10 bg-transparent"
                >
                  <Link href="/onramp">Buy PUFF Tokens</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
