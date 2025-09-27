// Content Security Policy configuration for PuffPass
const isDevelopment = process.env.NODE_ENV === "development"

const cspConfig = {
  "default-src": ["'self'"],
  "script-src": isDevelopment
    ? ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://vercel.live", "https://va.vercel-scripts.com"]
    : ["'self'", "https://vercel.live", "https://va.vercel-scripts.com"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
  "img-src": ["'self'", "data:", "https:", "blob:"],
  "connect-src": ["'self'", "https://vercel.live", "https://vitals.vercel-insights.com"],
  "frame-src": ["'self'", "https://vercel.live"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": [],
}

// Convert CSP object to header string
export function generateCSP() {
  return Object.entries(cspConfig)
    .map(([key, values]) => {
      if (values.length === 0) return key
      return `${key} ${values.join(" ")}`
    })
    .join("; ")
}

export default cspConfig
