import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, Coins, Shield, Zap, ArrowRight, Star, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { PuffPassLogo } from "@/components/puffpass-logo"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden cannabis-leaf-pattern">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="flex justify-end mb-8">
            <WalletConnectButton autoLogin={true} />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <PuffPassLogo size="xl" showText={false} className="mb-6" />
                <Badge variant="secondary" className="w-fit trust-badge">
                  <Leaf className="w-4 h-4 mr-2" />
                  Cannabis Payments Platform
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                  Welcome to <span className="vibrant-text font-black">Puff Pass</span>
                </h1>
                <p className="text-xl text-muted-foreground text-balance leading-relaxed">
                  The future of cannabis payments. Convert fiat to USDC, earn PUFF tokens, and enjoy seamless
                  transactions in the cannabis ecosystem.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg friendly-gradient smile-shadow">
                  <Link href="/onboard">
                    Get Started <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg playful-border hover:bg-primary/5 bg-transparent"
                >
                  <Link href="/onramp">Buy PUFF Tokens</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">$2M+</div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Merchants</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-card border playful-border rounded-3xl p-8 smile-shadow">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 friendly-gradient rounded-2xl flex items-center justify-center">
                        <Coins className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">PUFF Balance</div>
                        <div className="text-sm text-muted-foreground">Available</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">1,247.50</div>
                      <div className="text-sm text-muted-foreground">PUFF</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-success/10 border border-success/20 rounded-xl">
                      <span className="text-sm font-medium">Recent Purchase</span>
                      <span className="text-sm font-bold text-success">+25.00 PUFF</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-success/10 border border-success/20 rounded-xl">
                      <span className="text-sm font-medium">Rewards Earned</span>
                      <span className="text-sm font-bold text-success">+12.50 PUFF</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 friendly-gradient rounded-3xl blur-2xl transform rotate-2 opacity-15"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-balance">Why Choose PuffPass?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
              Experience the most advanced cannabis payment platform with seamless fiat-to-crypto conversion
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="feature-item group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 friendly-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Instant Conversions</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Convert fiat to USDC instantly with our advanced payment processing system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-item group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 friendly-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Coins className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">PUFF Rewards</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Earn PUFF tokens on every purchase and unlock exclusive benefits in our ecosystem
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-item group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 friendly-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Secure & Compliant</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Bank-grade security with full compliance for cannabis industry regulations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-item group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 friendly-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Multi-Role Platform</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Designed for customers, merchants, and administrators with role-specific features
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-item group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 friendly-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Real-time Analytics</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Track your spending, earnings, and rewards with comprehensive analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-item group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 friendly-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Leaf className="w-8 h-8 text-primary-foreground" />
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
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Choose Your Role</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access tailored features designed for your specific needs in the cannabis ecosystem
            </p>
          </div>

          <Tabs defaultValue="customer" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="merchant">Merchant</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Customer Experience
                  </CardTitle>
                  <CardDescription>Shop cannabis products with seamless payments and earn rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Payment Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Instant fiat to USDC conversion</li>
                        <li>• Multiple payment methods</li>
                        <li>• Secure wallet integration</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Rewards & Benefits</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Earn PUFF tokens on purchases</li>
                        <li>• Loyalty tier progression</li>
                        <li>• Exclusive member discounts</li>
                      </ul>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/onboard">Start Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="merchant" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    Merchant Dashboard
                  </CardTitle>
                  <CardDescription>Manage your cannabis business with powerful tools and analytics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Business Management</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Product inventory management</li>
                        <li>• Order processing & fulfillment</li>
                        <li>• Customer relationship tools</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Payment Processing</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Accept PUFF token payments</li>
                        <li>• Real-time transaction tracking</li>
                        <li>• Automated compliance reporting</li>
                      </ul>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/merchant">Access Merchant Portal</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Admin Control Panel
                  </CardTitle>
                  <CardDescription>Oversee platform operations with comprehensive administrative tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Platform Management</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• User & merchant management</li>
                        <li>• PUFF token supply control</li>
                        <li>• System health monitoring</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Analytics & Reporting</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Transaction analytics</li>
                        <li>• Compliance reporting</li>
                        <li>• Revenue tracking</li>
                      </ul>
                    </div>
                  </div>
                  <Button asChild className="w-full">
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
          <Card className="friendly-gradient smile-shadow border-0">
            <CardContent className="p-12 text-center space-y-8">
              <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground text-balance">
                Ready to Join Puff Pass?
              </h2>
              <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto text-balance leading-relaxed">
                Start your journey in the cannabis payment ecosystem today. Convert fiat, earn PUFF tokens, and
                experience the future of cannabis commerce.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="text-lg bg-background text-primary hover:bg-background/90"
                >
                  <Link href="/onboard">
                    Create Account <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg playful-border hover:bg-primary-foreground/10 bg-transparent"
                >
                  <Link href="/onramp">Buy PUFF Tokens</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
