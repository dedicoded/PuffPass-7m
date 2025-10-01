import { ethers } from "ethers"

// Utility to derive wallet address from private key (for setup only)
export function deriveWalletAddress(privateKey: string): string {
  try {
    const wallet = new ethers.Wallet(privateKey)
    return wallet.address
  } catch (error) {
    throw new Error("Invalid private key format")
  }
}

// Verify if a wallet address is in the trusted list
export function isTrustedWallet(address: string): boolean {
  const trustedWallets = process.env.TRUSTED_WALLETS?.split(",").map((addr) => addr.trim().toLowerCase()) || []
  return trustedWallets.includes(address.toLowerCase())
}

// Get all trusted wallet addresses
export function getTrustedWallets(): string[] {
  return process.env.TRUSTED_WALLETS?.split(",").map((addr) => addr.trim()) || []
}
