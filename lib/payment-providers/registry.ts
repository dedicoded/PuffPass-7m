// Payment Provider Registry - Centralized provider management

import type { PaymentProvider } from "./base"
import { XAIGateProvider } from "./xaigate"

export class PaymentProviderRegistry {
  private providers = new Map<string, PaymentProvider>()
  private defaultProvider = "xaigate"

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

export const paymentRegistry = new PaymentProviderRegistry()
paymentRegistry.register(new XAIGateProvider())

// Future providers can be added here:
// paymentRegistry.register(new CircleProvider())
// paymentRegistry.register(new CoinbaseProvider())
