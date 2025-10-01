export type Role = "admin" | "merchant" | "customer"

export interface AuthSession {
  userId: string
  role: Role
  email: string
  exp: number
  iat: number
}

export async function requireAuth(req: Request): Promise<AuthSession> {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response("Unauthorized", { status: 401 })
  }

  const token = authHeader.slice(7)
  try {
    const session = await verifyJWT(token)
    if (!session || session.exp < Date.now() / 1000) {
      throw new Response("Token expired", { status: 401 })
    }
    return session
  } catch (error) {
    throw new Response("Invalid token", { status: 401 })
  }
}

export async function requireRole(role: Role, req: Request): Promise<AuthSession> {
  const session = await requireAuth(req)
  if (session.role !== role) {
    throw new Response("Forbidden", { status: 403 })
  }
  return session
}

export async function requireTrustee(req: Request): Promise<AuthSession> {
  const session = await requireRole("admin", req)

  const userWallet = await getUserWallet(session.userId)

  if (!userWallet) {
    throw new Response("No wallet address associated with account", { status: 403 })
  }

  if (!isTrustedWallet(userWallet)) {
    throw new Response("Trustee access required - wallet not authorized", { status: 403 })
  }

  return session
}

async function verifyJWT(token: string): Promise<AuthSession> {
  // Implementation depends on your JWT library
  // This is a placeholder for the actual JWT verification
  throw new Error("JWT verification not implemented")
}

async function getUserWallet(userId: string): Promise<string | null> {
  try {
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql`
      SELECT wallet_address 
      FROM users 
      WHERE id = ${userId}
    `

    return result[0]?.wallet_address || null
  } catch (error) {
    console.error("[v0] Error fetching user wallet:", error)
    return null
  }
}

function isTrustedWallet(walletAddress: string): boolean {
  const trustedWallets = process.env.TRUSTED_WALLETS?.split(",").map((addr) => addr.trim().toLowerCase()) || []
  return trustedWallets.includes(walletAddress.toLowerCase())
}
