export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  recoveryTimeout: number
  monitoringPeriod: number
  expectedErrors?: string[]
}

export interface CircuitBreakerMetrics {
  failures: number
  successes: number
  requests: number
  lastFailureTime?: number
  lastSuccessTime?: number
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED
  private metrics: CircuitBreakerMetrics = {
    failures: 0,
    successes: 0,
    requests: 0,
  }
  private nextAttempt = 0

  constructor(
    private name: string,
    private config: CircuitBreakerConfig,
  ) {}

  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    // Check if circuit should remain open
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        console.log(`[v0] Circuit breaker ${this.name} is OPEN, using fallback`)
        if (fallback) {
          return await fallback()
        }
        throw new Error(`Circuit breaker ${this.name} is OPEN - service unavailable`)
      } else {
        // Time to test if service recovered
        this.state = CircuitBreakerState.HALF_OPEN
        console.log(`[v0] Circuit breaker ${this.name} moving to HALF_OPEN for testing`)
      }
    }

    this.metrics.requests++

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error)

      // If we have a fallback and circuit is open, use it
      if (this.state === CircuitBreakerState.OPEN && fallback) {
        console.log(`[v0] Circuit breaker ${this.name} failed, using fallback`)
        return await fallback()
      }

      throw error
    }
  }

  private onSuccess(): void {
    this.metrics.successes++
    this.metrics.lastSuccessTime = Date.now()

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      console.log(`[v0] Circuit breaker ${this.name} test successful, moving to CLOSED`)
      this.state = CircuitBreakerState.CLOSED
      this.resetMetrics()
    }
  }

  private onFailure(error: unknown): void {
    this.metrics.failures++
    this.metrics.lastFailureTime = Date.now()

    console.log(
      `[v0] Circuit breaker ${this.name} failure ${this.metrics.failures}/${this.config.failureThreshold}:`,
      error instanceof Error ? error.message : String(error),
    )

    if (this.metrics.failures >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN
      this.nextAttempt = Date.now() + this.config.recoveryTimeout
      console.log(
        `[v0] Circuit breaker ${this.name} tripped to OPEN state, recovery in ${this.config.recoveryTimeout}ms`,
      )
    }
  }

  private resetMetrics(): void {
    this.metrics.failures = 0
    this.metrics.successes = 0
  }

  getState(): CircuitBreakerState {
    return this.state
  }

  getMetrics(): CircuitBreakerMetrics & { state: CircuitBreakerState } {
    return {
      ...this.metrics,
      state: this.state,
    }
  }

  // Manual controls for testing/ops
  forceOpen(): void {
    this.state = CircuitBreakerState.OPEN
    this.nextAttempt = Date.now() + this.config.recoveryTimeout
    console.log(`[v0] Circuit breaker ${this.name} manually forced to OPEN`)
  }

  forceClose(): void {
    this.state = CircuitBreakerState.CLOSED
    this.resetMetrics()
    console.log(`[v0] Circuit breaker ${this.name} manually forced to CLOSED`)
  }
}
