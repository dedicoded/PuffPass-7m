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

export function getRateLimitStatus(key: string): { remaining: number; reset: number } {
  const bucket = buckets.get(key)
  if (!bucket) return { remaining: 20, reset: Date.now() + 15 * 60_000 }

  return {
    remaining: Math.max(0, 20 - bucket.count),
    reset: bucket.reset,
  }
}

export function withRateLimit(handler: Function, options: { max?: number; windowMs?: number } = {}) {
  return async (req: Request) => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const key = `rate_limit:${ip}`

    if (!rateLimit(key, options.max, options.windowMs)) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((buckets.get(key)?.reset || Date.now()) / 1000).toString(),
        },
      })
    }

    return handler(req)
  }
}
