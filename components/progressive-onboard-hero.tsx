"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Lock, Users, Star, TrendingUp } from "lucide-react"

interface ProgressiveOnboardHeroProps {
  onGetStarted: () => void
}

export function ProgressiveOnboardHero({ onGetStarted }: ProgressiveOnboardHeroProps) {
  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-xl text-foreground">Puff Pass</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="trust-badge">
                <Shield className="w-3 h-3" />
                Secure by Design
              </Badge>
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="security-indicator">
                  <Lock className="w-4 h-4" />
                  Bank-Grade Security
                </Badge>
                <h1 className="text-5xl font-bold text-balance leading-tight">
                  Cannabis payments{" "}
                  <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                    without the middleman
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  The self-custody platform that brings the best of crypto directly to cannabis commerce. Pay instantly,
                  earn rewards, stay compliant.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="primary-gradient shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  onClick={onGetStarted}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="border-border/50 bg-transparent">
                  Learn More
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-success/20 border-2 border-background rounded-full flex items-center justify-center"
                      >
                        <Users className="w-4 h-4 text-success" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">10,000+ users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="text-sm text-muted-foreground">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Mobile Mockup */}
            <div className="relative">
              <div className="mobile-mockup">
                <div className="absolute inset-4 bg-background rounded-2xl overflow-hidden">
                  {/* Mock app interface */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Puff Pass Balance</div>
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">$401.84K</div>
                      <div className="flex items-center space-x-2 text-sm text-success">
                        <TrendingUp className="w-4 h-4" />
                        <span>+2.5% this week</span>
                      </div>
                    </div>
                    <div className="h-24 bg-success/10 rounded-lg flex items-end p-2">
                      <div className="w-full h-16 bg-gradient-to-t from-success/50 to-success/20 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" className="success-gradient">
                        Pay
                      </Button>
                      <Button size="sm" variant="outline">
                        Transfer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-success/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
