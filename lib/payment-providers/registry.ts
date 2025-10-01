// Payment Provider Registry - Centralized provider management

import type { PaymentProvider } from "./base"
import { CybridProvider } from "./cybrid"

export class PaymentProviderRegistry {
  private providers = new Map<string, PaymentProvider>()
  private defaultProvider = "cybrid"

  register(provider: PaymentProvider) {
    this.providers.set(provider.name, provider)
    console.log(`[v0] Registered payment provider: ${provider.name}`)
  }

  get(name: string): PaymentProvider | undefined {
    return this.providers.get(name)
  }

  getDefault(): PaymentProvider {
    const provider = this.providers.get(this.defaultProvider)
    if (!provider) {
      throw new Error(`Default provider ${this.defaultProvider} not found`)
    }
    return provider
  }

  setDefault(name: string) {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not registered`)
    }
    this.defaultProvider = name
  }

  getAll(): PaymentProvider[] {
    return Array.from(this.providers.values())
  }

  has(name: string): boolean {
    return this.providers.has(name)
  }
}

// Initialize global registry with Cybrid as primary provider
export const paymentRegistry = new PaymentProviderRegistry()
paymentRegistry.register(new CybridProvider())

// Future providers can be added here:
// paymentRegistry.register(new SphereProvider())
// paymentRegistry.register(new StripeProvider())
