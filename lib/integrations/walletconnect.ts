/**
 * WalletConnect Configuration
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: Your WalletConnect project ID
 *
 * Get your project ID at: https://cloud.walletconnect.com
 */

export const walletConnectConfig = {
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  metadata: {
    name: "PuffPass",
    description: "Cannabis marketplace with blockchain integration",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://puffpass.com",
    icons: ["https://puffpass.com/icon.png"],
  },
}

export function getWalletConnectProjectId(): string {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

  if (!projectId || projectId === "demo-project-id") {
    console.warn("[WalletConnect] Using demo project ID. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for production.")
  }

  return projectId || "demo-project-id"
}
