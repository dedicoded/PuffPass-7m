import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminWallet } from "@/lib/auth"
import { requireTrustee } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  try {
    const session = await requireTrustee(req)

    const { walletAddress, signature } = await req.json()

    if (!walletAddress || !signature) {
      return NextResponse.json({ error: "Wallet address and signature required" }, { status: 400 })
    }

    const isValid = await verifyAdminWallet(walletAddress, signature)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid trustee wallet or signature" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      message: "Trustee access verified",
      walletAddress,
      userId: session.userId,
    })
  } catch (error) {
    console.error("[v0] Trustee verification error:", error)
    return NextResponse.json({ error: "Trustee verification failed" }, { status: 500 })
  }
}
