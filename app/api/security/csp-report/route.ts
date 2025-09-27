import { type NextRequest, NextResponse } from "next/server"

// Rate limiting map to prevent spam
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 10 // Max 10 reports per minute per IP

// Deduplication map to prevent duplicate violation logging
const violationCache = new Map<string, number>()
const CACHE_DURATION = 300000 // 5 minutes

function getRateLimitKey(ip: string): string {
  return `csp-report:${ip}`
}

function isRateLimited(ip: string): boolean {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const limit = rateLimitMap.get(key)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    console.log(`🔒 [CSP Security] Rate limit exceeded for IP: ${ip}`)
    return true
  }

  limit.count++
  return false
}

function createViolationKey(violation: any): string {
  return `${violation.directive || "unknown"}:${violation.blocked || "unknown"}:${violation.document || "unknown"}`
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "127.0.0.1"

    // Rate limiting
    if (isRateLimited(ip)) {
      return new NextResponse(null, { status: 429 })
    }

    const body = await request.json()
    const report = body["csp-report"] || body

    if (!report) {
      return new NextResponse(null, { status: 400 })
    }

    // Create violation key for deduplication
    const violationKey = createViolationKey(report)
    const now = Date.now()
    const lastSeen = violationCache.get(violationKey)

    if (lastSeen && now - lastSeen < CACHE_DURATION) {
      console.log("🔒 [CSP Security] Deduped 1 duplicate violation(s)")
      return new NextResponse(null, { status: 204 })
    }

    // Store violation timestamp
    violationCache.set(violationKey, now)

    // Log unique violations only
    const violation = {
      directive: report["violated-directive"] || report.directive,
      blocked: report["blocked-uri"] || report.blocked,
      document: report["document-uri"] || report.document,
      format: "csp-report",
    }

    console.log("🔒 [CSP Security] 1 unique violation(s) reported:", {
      violations: [violation],
      deduped: 0,
      clientIP: ip,
      timestamp: new Date().toISOString(),
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("🔒 [CSP Security] Error processing report:", error)
    return new NextResponse(null, { status: 500 })
  }
}
