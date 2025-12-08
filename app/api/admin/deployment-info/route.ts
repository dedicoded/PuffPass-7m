import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return deployment information
    const deploymentInfo = {
      name: "PuffPass Cannabis Platform",
      version: "1.0.0",
      description: "Cannabis marketplace platform with crypto-native payment processing",
      deployments: {
        production: {
          url: "https://puffpass.vercel.app",
          branch: "main",
          environment: "production",
        },
        staging: {
          url: "https://puffpass-staging.vercel.app",
          branch: "develop",
          environment: "staging",
        },
      },
      features: [
        "Role-based authentication",
        "Product catalog",
        "Order management",
        "Crypto-native payment processing",
        "Age verification",
        "Compliance tracking",
      ],
      tech_stack: {
        frontend: "Next.js 15",
        styling: "Tailwind CSS v4",
        database: "PostgreSQL",
        orm: "Drizzle",
        auth: "NextAuth.js",
        payments: "XAIGATE (USDC on Solana)",
        deployment: "Vercel",
      },
    }

    return NextResponse.json(deploymentInfo)
  } catch (error) {
    console.error("Error fetching deployment info:", error)
    return NextResponse.json({ error: "Failed to fetch deployment info" }, { status: 500 })
  }
}
