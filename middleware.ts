import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AGE_VERIFICATION_ALLOWLIST = [
  "/age-verification",
  "/login",
  "/register",
  "/api",
  "/_next",
  "/_vercel",
  "/favicon.ico",
  "/public",
]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  console.log("[v0] Middleware processing:", pathname)

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Cannabis platform specific headers
  response.headers.set("X-Cannabis-Platform", "MyCora")

  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "0.0.0.0"
  const userAgent = request.headers.get("user-agent") ?? "unknown"
  const userId = request.cookies.get("user_id")?.value

  const isAllowlisted = AGE_VERIFICATION_ALLOWLIST.some((path) => pathname.startsWith(path))

  if (isAllowlisted) {
    console.log("[AGE-VERIFICATION] Skipping for allowlisted route:", pathname)

    // Admin route protection still applies
    if (pathname.startsWith("/admin")) {
      const adminToken = request.cookies.get("admin-session") || request.cookies.get("admin-trustee-token")
      if (!adminToken) {
        console.log("[v0] Redirecting to admin login")
        return NextResponse.redirect(new URL("/login?role=admin", request.url))
      }
    }

    return response
  }

  const ageVerified = request.cookies.get("age-verified")

  if (!ageVerified) {
    console.log("[AGE-VERIFICATION] Blocked:", pathname)
    return NextResponse.redirect(new URL("/age-verification", request.url))
  }

  console.log("[AGE-VERIFICATION] Passed:", pathname)

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin-session") || request.cookies.get("admin-trustee-token")
    if (!adminToken) {
      console.log("[v0] Redirecting to admin login")
      return NextResponse.redirect(new URL("/login?role=admin", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/|_next/static|_next/image|favicon.ico).*)",
  ],
}
