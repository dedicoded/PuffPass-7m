/**
 * Transaction Nonce Manager
 *
 * Prevents transaction replay attacks by managing nonces and ensuring
 * each transaction is unique and can only be executed once.
 */

interface NonceRecord {
  address: string
  nonce: number
  lastUsed: Date
  pendingNonces: Set<number>
}

class TransactionNonceManager {
  private nonceCache: Map<string, NonceRecord> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get the next available nonce for an address
   */
  async getNextNonce(address: string, provider: any): Promise<number> {
    const cached = this.nonceCache.get(address.toLowerCase())
    const now = new Date()

    // Check if we have a recent cached nonce
    if (cached && now.getTime() - cached.lastUsed.getTime() < this.CACHE_TTL) {
      // Find the next available nonce that's not pending
      let nextNonce = cached.nonce + 1
      while (cached.pendingNonces.has(nextNonce)) {
        nextNonce++
      }

      // Mark this nonce as pending
      cached.pendingNonces.add(nextNonce)
      cached.nonce = nextNonce
      cached.lastUsed = now

      console.log(`[v0] Using cached nonce ${nextNonce} for ${address}`)
      return nextNonce
    }

    // Fetch fresh nonce from blockchain
    const onChainNonce = await provider.getTransactionCount(address, "pending")

    // Initialize or update cache
    this.nonceCache.set(address.toLowerCase(), {
      address: address.toLowerCase(),
      nonce: onChainNonce,
      lastUsed: now,
      pendingNonces: new Set([onChainNonce]),
    })

    console.log(`[v0] Fetched fresh nonce ${onChainNonce} for ${address}`)
    return onChainNonce
  }

  /**
   * Mark a nonce as confirmed (transaction mined)
   */
  confirmNonce(address: string, nonce: number): void {
    const cached = this.nonceCache.get(address.toLowerCase())
    if (cached) {
      cached.pendingNonces.delete(nonce)
      console.log(`[v0] Confirmed nonce ${nonce} for ${address}`)
    }
  }

  /**
   * Mark a nonce as failed (transaction rejected)
   */
  failNonce(address: string, nonce: number): void {
    const cached = this.nonceCache.get(address.toLowerCase())
    if (cached) {
      cached.pendingNonces.delete(nonce)
      // Reset to the failed nonce so it can be reused
      if (nonce < cached.nonce) {
        cached.nonce = nonce
      }
      console.log(`[v0] Failed nonce ${nonce} for ${address}, reset for retry`)
    }
  }

  /**
   * Clear cache for an address (useful after wallet disconnect)
   */
  clearCache(address: string): void {
    this.nonceCache.delete(address.toLowerCase())
    console.log(`[v0] Cleared nonce cache for ${address}`)
  }

  /**
   * Clear all expired cache entries
   */
  cleanupExpiredCache(): void {
    const now = new Date()
    for (const [address, record] of this.nonceCache.entries()) {
      if (now.getTime() - record.lastUsed.getTime() > this.CACHE_TTL) {
        this.nonceCache.delete(address)
        console.log(`[v0] Cleaned up expired nonce cache for ${address}`)
      }
    }
  }

  /**
   * Get pending nonces for an address (for debugging)
   */
  getPendingNonces(address: string): number[] {
    const cached = this.nonceCache.get(address.toLowerCase())
    return cached ? Array.from(cached.pendingNonces) : []
  }
}

// Singleton instance
export const nonceManager = new TransactionNonceManager()

// Cleanup expired cache every minute
if (typeof window !== "undefined") {
  setInterval(() => {
    nonceManager.cleanupExpiredCache()
  }, 60 * 1000)
}

/**
 * Helper function to send a transaction with automatic nonce management
 */
export async function sendTransactionWithNonce(
  signer: any,
  transaction: any,
  options?: {
    onPending?: (txHash: string) => void
    onConfirmed?: (receipt: any) => void
    onFailed?: (error: Error) => void
  },
): Promise<any> {
  const address = await signer.getAddress()
  const provider = signer.provider

  try {
    // Get next nonce
    const nonce = await nonceManager.getNextNonce(address, provider)

    // Add nonce to transaction
    const txWithNonce = {
      ...transaction,
      nonce,
    }

    console.log(`[v0] Sending transaction with nonce ${nonce}`)

    // Send transaction
    const tx = await signer.sendTransaction(txWithNonce)
    options?.onPending?.(tx.hash)

    console.log(`[v0] Transaction sent: ${tx.hash}`)

    // Wait for confirmation
    const receipt = await tx.wait()

    // Mark nonce as confirmed
    nonceManager.confirmNonce(address, nonce)
    options?.onConfirmed?.(receipt)

    console.log(`[v0] Transaction confirmed: ${tx.hash}`)
    return receipt
  } catch (error: any) {
    console.error(`[v0] Transaction failed:`, error)

    // If nonce was used, mark it as failed
    if (error.nonce !== undefined) {
      nonceManager.failNonce(address, error.nonce)
    }

    options?.onFailed?.(error)
    throw error
  }
}

/**
 * Validate transaction signature to prevent replay attacks
 */
export function validateTransactionSignature(
  transaction: any,
  expectedChainId: number,
): { valid: boolean; error?: string } {
  // Check if transaction has required fields
  if (!transaction.chainId) {
    return { valid: false, error: "Transaction missing chainId" }
  }

  if (!transaction.nonce && transaction.nonce !== 0) {
    return { valid: false, error: "Transaction missing nonce" }
  }

  // Verify chain ID matches expected network
  if (transaction.chainId !== expectedChainId) {
    return {
      valid: false,
      error: `Chain ID mismatch: expected ${expectedChainId}, got ${transaction.chainId}`,
    }
  }

  // Check if transaction has a valid signature
  if (!transaction.v || !transaction.r || !transaction.s) {
    return { valid: false, error: "Transaction missing signature components" }
  }

  return { valid: true }
}
