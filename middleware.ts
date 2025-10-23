import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const AGE_VERIFICATION_ALLOWLIST = [
  "/age-verification",
  "/login",
  "/register",
  "/onboard", // Added /onboard to allow post-registration flow
  "/admin", // Admin routes bypass age verification
  "/api",
  "/_next",
  "/_vercel",
  "/favicon.ico",
  "/public",
]

async function verifySessionToken(token: string): Promise<{ role: string; userId: string } | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret-for-dev",
    )
    const { payload } = await jwtVerify(token, secret)
    return {
      role: payload.role as string,
      userId: payload.userId as string,
    }
  } catch (error) {
    console.log("[v0] Session verification failed:", error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  console.log("[v0] Middleware processing:", pathname)

  // Create response
  const response = NextResponse.next()

  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("X-Cannabis-Platform", "MyCora")

  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "0.0.0.0"
  const userAgent = request.headers.get("user-agent") ?? "unknown"
  const userId = request.cookies.get("user_id")?.value

  const isAllowlisted = AGE_VERIFICATION_ALLOWLIST.some((path) => pathname.startsWith(path))

  if (isAllowlisted) {
    console.log("[AGE-VERIFICATION] Skipping for allowlisted route:", pathname)

    if (pathname.startsWith("/admin")) {
      const sessionToken = request.cookies.get("session")?.value

      if (!sessionToken) {
        console.log("[v0] No session token found, redirecting to login")
        return NextResponse.redirect(new URL("/login?role=admin", request.url))
      }

      const session = await verifySessionToken(sessionToken)

      if (!session || session.role !== "admin") {
        console.log("[v0] Invalid session or not admin, redirecting to login")
        return NextResponse.redirect(new URL("/login?role=admin", request.url))
      }

      console.log("[v0] Admin session verified, allowing access")
    }

    return response
  }

  const ageVerified = request.cookies.get("age-verified")

  if (!ageVerified) {
    console.log("[AGE-VERIFICATION] Blocked:", pathname)
    return NextResponse.redirect(new URL("/age-verification", request.url))
  }

  console.log("[AGE-VERIFICATION] Passed:", pathname)

  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      console.log("[v0] No session token found, redirecting to login")
      return NextResponse.redirect(new URL("/login?role=admin", request.url))
    }

    const session = await verifySessionToken(sessionToken)

    if (!session || session.role !== "admin") {
      console.log("[v0] Invalid session or not admin, redirecting to login")
      return NextResponse.redirect(new URL("/login?role=admin", request.url))
    }

    console.log("[v0] Admin session verified, allowing access")
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
