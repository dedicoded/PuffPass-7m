import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { ethers } from "ethers"

const REDEMPTION_ABI = [
  "function fundVault(uint256 amount) external",
  "function getVaultBalance() external view returns (uint256)",
]

export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amountUsdc } = await req.json()

    if (!amountUsdc || Number.parseFloat(amountUsdc) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const amountUnits = ethers.parseUnits(amountUsdc.toString(), 6)

    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider)

    const redemptionContract = new ethers.Contract(process.env.REDEMPTION_CONTRACT_ADDRESS!, REDEMPTION_ABI, wallet)

    console.log("[v0] Funding vault with", amountUsdc, "USDC")
    const tx = await redemptionContract.fundVault(amountUnits)
    console.log("[v0] Transaction sent:", tx.hash)

    await tx.wait()
    console.log("[v0] Transaction confirmed")

    await sql`
      INSERT INTO puff_vault_transactions (type, amount_usdc, tx_hash, status, created_at)
      VALUES ('fund', ${amountUsdc}, ${tx.hash}, 'completed', NOW())
    `

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      amount: amountUsdc,
    })
  } catch (error: any) {
    console.error("[v0] Fund vault error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to fund vault",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)
    const redemptionContract = new ethers.Contract(process.env.REDEMPTION_CONTRACT_ADDRESS!, REDEMPTION_ABI, provider)

    const balance = await redemptionContract.getVaultBalance()
    const balanceUsdc = ethers.formatUnits(balance, 6)

    return NextResponse.json({
      balanceUsdc: Number.parseFloat(balanceUsdc),
    })
  } catch (error: any) {
    console.error("[v0] Get vault balance error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to get vault balance",
      },
      { status: 500 },
    )
  }
}
