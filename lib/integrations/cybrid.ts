/**
 * Cybrid Banking Integration
 *
 * Environment Variables Required:
 * - CYBRID_API_KEY: Your Cybrid API key
 * - CYBRID_API_URL: Cybrid API base URL (optional, defaults to production)
 * - CYBRID_ORG_GUID: Your organization GUID
 * - CYBRID_BANK_GUID: Your bank GUID
 * - CYBRID_CLIENT_ID: Your client ID
 * - CYBRID_CLIENT_SECRET: Your client secret
 *
 * Documentation: https://docs.cybrid.xyz
 */

export const cybridConfig = {
  apiKey: process.env.CYBRID_API_KEY,
  apiUrl: process.env.CYBRID_API_URL || "https://bank.production.cybrid.app",
  orgGuid: process.env.CYBRID_ORG_GUID,
  bankGuid: process.env.CYBRID_BANK_GUID,
  clientId: process.env.CYBRID_CLIENT_ID,
  clientSecret: process.env.CYBRID_CLIENT_SECRET,
}

export function getCybridHeaders() {
  if (!cybridConfig.apiKey) {
    throw new Error("CYBRID_API_KEY is not configured")
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cybridConfig.apiKey}`,
  }
}

export function isCybridConfigured(): boolean {
  return !!(cybridConfig.apiKey && cybridConfig.orgGuid && cybridConfig.bankGuid && cybridConfig.clientId)
}
