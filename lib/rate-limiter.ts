interface RateLimitBucket {
  count: number
  reset: number
}

const buckets = new Map<string, RateLimitBucket>()

export function rateLimit(key: string, max = 20, windowMs = 15 * 60_000): boolean {
  const now = Date.now()
  const bucket = buckets.get(key) ?? { count: 0, reset: now + windowMs }

  if (now > bucket.reset) {
    Object.assign(bucket, { count: 0, reset: now + windowMs })
  }

  bucket.count++
  buckets.set(key, bucket)

  return bucket.count <= max
}

export function getRateLimitStatus(key: string, max = 20): { remaining: number; reset: number } {
  const bucket = buckets.get(key)
  if (!bucket) return { remaining: max, reset: Date.now() + 15 * 60_000 }

  return {
    remaining: Math.max(0, max - bucket.count),
    reset: bucket.reset,
  }
}

export function withRateLimit(handler: Function, options: { max?: number; windowMs?: number } = {}) {
  return async (req: Request) => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const key = `rate_limit:${ip}`

    if (!rateLimit(key, options.max, options.windowMs)) {
      const status = getRateLimitStatus(key, options.max)
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((status.reset - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": (options.max || 20).toString(),
          "X-RateLimit-Remaining": status.remaining.toString(),
          "X-RateLimit-Reset": status.reset.toString(),
        },
      })
    }

    return handler(req)
  }
}

export interface RateLimitConfig {
  points: number // Number of requests
  duration: number // Time window in seconds
  blockDuration?: number // How long to block after limit exceeded
}

export class AdvancedRateLimiter {
  private config: RateLimitConfig
  private storage: Map<string, { points: number; resetAt: number; blockedUntil?: number }>

  constructor(config: RateLimitConfig) {
    this.config = config
    this.storage = new Map()
  }

  async consume(key: string, points = 1): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const record = this.storage.get(key)

    // Check if blocked
    if (record?.blockedUntil && record.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.blockedUntil,
      }
    }

    // Reset if window expired
    if (!record || record.resetAt < now) {
      this.storage.set(key, {
        points: points,
        resetAt: now + this.config.duration * 1000,
      })
      return {
        allowed: true,
        remaining: this.config.points - points,
        resetAt: now + this.config.duration * 1000,
      }
    }

    // Consume points
    record.points += points

    if (record.points > this.config.points) {
      // Block if configured
      if (this.config.blockDuration) {
        record.blockedUntil = now + this.config.blockDuration * 1000
      }

      this.storage.set(key, record)

      return {
        allowed: false,
        remaining: 0,
        resetAt: record.blockedUntil || record.resetAt,
      }
    }

    this.storage.set(key, record)

    return {
      allowed: true,
      remaining: this.config.points - record.points,
      resetAt: record.resetAt,
    }
  }

  async reset(key: string): Promise<void> {
    this.storage.delete(key)
  }

  async getStatus(key: string): Promise<{ points: number; remaining: number; resetAt: number }> {
    const record = this.storage.get(key)
    const now = Date.now()

    if (!record || record.resetAt < now) {
      return {
        points: 0,
        remaining: this.config.points,
        resetAt: now + this.config.duration * 1000,
      }
    }

    return {
      points: record.points,
      remaining: Math.max(0, this.config.points - record.points),
      resetAt: record.resetAt,
    }
  }
}

// Predefined rate limiters for different use cases
export const paymentRateLimiter = new AdvancedRateLimiter({
  points: 10, // 10 payments
  duration: 60, // per minute
  blockDuration: 300, // block for 5 minutes if exceeded
})

export const apiRateLimiter = new AdvancedRateLimiter({
  points: 100, // 100 requests
  duration: 60, // per minute
})

export const authRateLimiter = new AdvancedRateLimiter({
  points: 5, // 5 attempts
  duration: 300, // per 5 minutes
  blockDuration: 900, // block for 15 minutes if exceeded
})
