type HttpOpts = RequestInit & { retries?: number; timeoutMs?: number }

export async function api<T>(path: string, opts: HttpOpts = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_VERCEL_URL ?? ""
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10_000)

  const attempt = async (n: number): Promise<T> => {
    const res = await fetch(`${base}${path}`, {
      ...opts,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
      signal: controller.signal,
    })

    const ct = res.headers.get("content-type") || ""
    if (!ct.includes("application/json")) {
      throw new Error(`Non-JSON response: ${res.status} ${ct}`)
    }

    if (res.status === 401 && n > 0) {
      await refreshAuth()
      return attempt(n - 1)
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    return res.json()
  }

  try {
    return await attempt(opts.retries ?? 2)
  } finally {
    clearTimeout(timeout)
  }
}

async function refreshAuth() {
  try {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) throw new Error("No refresh token")

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    if (response.ok) {
      const { accessToken, refreshToken: newRefreshToken } = await response.json()
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", newRefreshToken)
    }
  } catch (error) {
    console.error("Auth refresh failed:", error)
    // Redirect to login or handle auth failure
    window.location.href = "/login"
  }
}
