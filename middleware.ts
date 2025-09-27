import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  console.log("[v0] Middleware processing:", request.nextUrl.pathname)

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Cannabis platform specific headers
  response.headers.set("X-Cannabis-Platform", "MyCora")

  const pathname = request.nextUrl.pathname

  if (pathname === "/age-verification" || pathname === "/login" || pathname === "/register") {
    console.log("[v0] Skipping age verification for:", pathname)
    return response
  }

  // Age verification for cannabis content (including homepage)
  if (pathname === "/" || pathname.startsWith("/products") || pathname.startsWith("/shop")) {
    const ageVerified = request.cookies.get("age-verified")
    if (!ageVerified) {
      console.log("[v0] Redirecting to age verification")
      return NextResponse.redirect(new URL("/age-verification", request.url))
    }
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin-token")
    if (!adminToken) {
      console.log("[v0] Redirecting to admin login")
      return NextResponse.redirect(new URL("/login?role=admin", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
