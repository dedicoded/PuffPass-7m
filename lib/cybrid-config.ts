// Cybrid SDK Configuration
export const cybridConfig = {
  // Organization and Bank GUIDs
  organizationGuid: process.env.NEXT_PUBLIC_CYBRID_ORGANIZATION_GUID || "553f2499a0faf6200e62dbec8791d6aa",
  bankGuid: process.env.NEXT_PUBLIC_CYBRID_BANK_GUID || "5115de8d1da4f5754dc9893390f5e3ae",

  // Account GUIDs
  accounts: {
    reserve: process.env.NEXT_PUBLIC_CYBRID_RESERVE_ACCOUNT_GUID || "4229014f138435ba0e8dfc3be1153ccb",
    gas: process.env.NEXT_PUBLIC_CYBRID_GAS_ACCOUNT_GUID || "1dd9e5ab2387fed0282fb3309cc939ee",
    fee: process.env.NEXT_PUBLIC_CYBRID_FEE_ACCOUNT_GUID || "1c1916b4b892cb81d6f73faf8a57cc34",
  },

  // API Configuration
  authUrl: process.env.NEXT_PUBLIC_CYBRID_AUTH_URL || "https://id.sandbox.cybrid.app",
  apiUrl: process.env.NEXT_PUBLIC_CYBRID_API_URL || "https://bank.sandbox.cybrid.app",
  environment: process.env.NEXT_PUBLIC_CYBRID_ENVIRONMENT || "sandbox",

  // Client credentials (server-side only)
  // WARNING: These are SANDBOX credentials. For production, set these in Vercel environment variables.
  clientId: process.env.CYBRID_CLIENT_ID || "P4q17wRMfSlfdlQLszhkEEmZU5w7zHKCNx1lmQWpbhI",
  clientSecret: process.env.CYBRID_CLIENT_SECRET || "SFyBNkYmw5hWgP_YLRflDq4dQQL6Q6j01zktfDa_MY",
}

export type CybridConfig = typeof cybridConfig
