import { ethers } from "ethers"
import { getSql } from "@/lib/db"

// Polygon USDC contract address
const POLYGON_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"

// ABI for USDC ERC-20 contract
const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]

// ABI for PuffPassRouter contract
const ROUTER_ABI = [
  "function pay(address merchant, uint256 amount) external",
  "function merchantVaults(address merchant) view returns (uint256)",
  "function batchSettle(address[] merchants, uint256[] amounts) external",
  "function withdraw(address merchant, bool isInstant) external",
]

interface MerchantBalance {
  merchantId: string
  walletAddress: string
  vaultBalance: string // in USDC (6 decimals)
  pendingPayments: number
}

export class PolygonBatchService {
  private provider: ethers.providers.JsonRpcProvider
  private wallet: ethers.Wallet
  private routerContract: ethers.Contract
  private usdcContract: ethers.Contract

  constructor() {
    // Initialize provider and wallet
    this.provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com")

    this.wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY!, this.provider)

    // Initialize contracts
    const routerAddress = process.env.PUFFPASS_ROUTER_ADDRESS!
    this.routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, this.wallet)
    this.usdcContract = new ethers.Contract(POLYGON_USDC, USDC_ABI, this.wallet)
  }

  /**
   * Fetch all merchants with pending vault balances
   */
  async getMerchantsWithBalances(): Promise<MerchantBalance[]> {
    const sql = getSql()

    // Query merchants who have received payments
    const merchants = await sql`
      SELECT 
        m.id as merchant_id,
        m.wallet_address,
        COUNT(DISTINCT p.id) as pending_payments,
        SUM(p.amount * 0.97) as vault_balance
      FROM merchants m
      INNER JOIN payments p ON p.merchant_id = m.id
      WHERE p.status = 'completed'
        AND p.settled_at IS NULL
      GROUP BY m.id, m.wallet_address
      HAVING SUM(p.amount * 0.97) > 0
    `

    return merchants.map((m: any) => ({
      merchantId: m.merchant_id,
      walletAddress: m.wallet_address,
      vaultBalance: m.vault_balance,
      pendingPayments: m.pending_payments,
    }))
  }

  /**
   * Execute batch settlement on Polygon
   */
  async executeBatchSettlement(): Promise<{
    success: boolean
    merchantsSettled: number
    totalAmount: string
    gasUsed: string
    txHash?: string
    error?: string
  }> {
    console.log("[v0] Starting batch settlement process...")

    try {
      // Get merchants with vault balances
      const merchants = await this.getMerchantsWithBalances()

      if (merchants.length === 0) {
        console.log("[v0] No merchants to settle")
        return {
          success: true,
          merchantsSettled: 0,
          totalAmount: "0",
          gasUsed: "0",
        }
      }

      console.log(`[v0] Found ${merchants.length} merchants to settle`)

      // Prepare arrays for batch transaction
      const addresses = merchants.map((m) => m.walletAddress)
      const amounts = merchants.map((m) => ethers.utils.parseUnits(m.vaultBalance, 6))

      // Calculate total amount
      const totalAmount = amounts.reduce((acc, amt) => acc.add(amt), ethers.BigNumber.from(0))

      console.log(`[v0] Total settlement amount: ${ethers.utils.formatUnits(totalAmount, 6)} USDC`)

      // Check treasury balance
      const treasuryBalance = await this.usdcContract.balanceOf(this.wallet.address)
      if (treasuryBalance.lt(totalAmount)) {
        throw new Error(
          `Insufficient treasury balance. Need ${ethers.utils.formatUnits(totalAmount, 6)} USDC, have ${ethers.utils.formatUnits(treasuryBalance, 6)} USDC`,
        )
      }

      // Approve router to spend USDC
      console.log("[v0] Approving USDC spend...")
      const approveTx = await this.usdcContract.approve(this.routerContract.address, totalAmount)
      await approveTx.wait()

      // Execute batch settlement
      console.log("[v0] Executing batch settlement transaction...")
      const settleTx = await this.routerContract.batchSettle(addresses, amounts, {
        gasLimit: 500000 + merchants.length * 50000, // Dynamic gas limit
      })

      const receipt = await settleTx.wait()
      console.log(`[v0] Batch settlement successful! TX: ${receipt.transactionHash}`)

      // Update database
      await this.markPaymentsAsSettled(merchants)

      return {
        success: true,
        merchantsSettled: merchants.length,
        totalAmount: ethers.utils.formatUnits(totalAmount, 6),
        gasUsed: ethers.utils.formatUnits(receipt.gasUsed.mul(receipt.effectiveGasPrice), 18),
        txHash: receipt.transactionHash,
      }
    } catch (error: any) {
      console.error("[v0] Batch settlement failed:", error)
      return {
        success: false,
        merchantsSettled: 0,
        totalAmount: "0",
        gasUsed: "0",
        error: error.message,
      }
    }
  }

  /**
   * Mark payments as settled in database
   */
  private async markPaymentsAsSettled(merchants: MerchantBalance[]): Promise<void> {
    const sql = getSql()
    const merchantIds = merchants.map((m) => m.merchantId)

    await sql`
      UPDATE payments
      SET 
        settled_at = NOW(),
        settlement_status = 'completed'
      WHERE merchant_id IN ${sql(merchantIds)}
        AND status = 'completed'
        AND settled_at IS NULL
    `

    console.log(`[v0] Marked ${merchantIds.length} merchants' payments as settled`)
  }

  /**
   * Get settlement history
   */
  async getSettlementHistory(limit = 30) {
    const sql = getSql()

    return await sql`
      SELECT 
        DATE(settled_at) as settlement_date,
        COUNT(DISTINCT merchant_id) as merchants_count,
        COUNT(*) as payments_count,
        SUM(amount) as total_amount
      FROM payments
      WHERE settled_at IS NOT NULL
      GROUP BY DATE(settled_at)
      ORDER BY settlement_date DESC
      LIMIT ${limit}
    `
  }
}

export const polygonBatchService = new PolygonBatchService()
