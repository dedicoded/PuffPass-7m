/**
 * Biconomy Gasless Transaction Integration
 *
 * Environment Variables Required:
 * - BICONOMY_API_KEY: Your Biconomy API key
 * - BICONOMY_PROJECT_ID: Your Biconomy project ID
 *
 * Documentation: https://docs.biconomy.io
 */

export const biconomyConfig = {
  apiKey: process.env.BICONOMY_API_KEY,
  projectId: process.env.BICONOMY_PROJECT_ID,
}

export function getBiconomyConfig() {
  if (!biconomyConfig.apiKey || !biconomyConfig.projectId) {
    console.warn("[Biconomy] API key or project ID not configured. Gasless transactions will not be available.")
    return null
  }

  return {
    apiKey: biconomyConfig.apiKey,
    projectId: biconomyConfig.projectId,
  }
}

export function isBiconomyConfigured(): boolean {
  return !!(biconomyConfig.apiKey && biconomyConfig.projectId)
}
