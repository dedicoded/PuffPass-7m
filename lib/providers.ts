import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Cache provider IDs to avoid repeated database queries
const providerCache = new Map<string, number>()

export async function getProviderId(providerName: string): Promise<number> {
  // Check cache first
  if (providerCache.has(providerName)) {
    return providerCache.get(providerName)!
  }

  // Fetch from database
  const result = await sql`
    SELECT id
    FROM providers
    WHERE name = ${providerName}
    LIMIT 1
  `

  if (result.length === 0) {
    throw new Error(`Unknown provider: ${providerName}`)
  }

  const providerId = result[0].id
  providerCache.set(providerName, providerId)

  return providerId
}
