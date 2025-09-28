/**
 * Get the base URL for API calls
 * Handles both development and production environments
 */
export function getBaseUrl(): string {
  // In browser, use relative URLs for same-origin requests
  if (typeof window !== "undefined") {
    return ""
  }

  // On server, we need the full URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback for local development
  return "http://localhost:3000"
}

/**
 * Create a full API URL
 */
export function createApiUrl(path: string): string {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}
