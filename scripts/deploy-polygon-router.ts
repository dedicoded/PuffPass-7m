import { ethers } from "hardhat"
import * as fs from "fs"
import * as path from "path"

interface DeploymentConfig {
  network: string
  usdcAddress: string
  treasuryAddress: string
  ownerAddress: string
}

async function validateConfig(config: DeploymentConfig): Promise<boolean> {
  console.log("[v0] Validating deployment configuration...")

  const provider = ethers.provider
  const balance = await provider.getBalance(config.ownerAddress)
  const minBalance = ethers.utils.parseEther("0.01")

  if (balance.lt(minBalance)) {
    throw new Error(
      `Insufficient balance: ${ethers.utils.formatEther(balance)} MATIC. Need at least 0.01 MATIC for gas.`,
    )
  }

  console.log("[v0] Configuration validated successfully")
  return true
}

async function main() {
  try {
    const [deployer] = await ethers.getSigners()
    const network = await ethers.provider.getNetwork()

    console.log("[v0] Deploying PuffPassRouter...")
    console.log(`[v0] Network: ${network.name} (${network.chainId})`)
    console.log(`[v0] Deployer: ${deployer.address}`)

    // Polygon USDC addresses
    const USDC_ADDRESSES: Record<number, string> = {
      137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon mainnet
      80001: "0x62359Ed7505Efc61FF1D56fEF82158CcaffA23D7", // Mumbai testnet
    }

    const usdcAddress = USDC_ADDRESSES[network.chainId]
    if (!usdcAddress) {
      throw new Error(`Unsupported network: ${network.chainId}`)
    }

    const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address

    const config: DeploymentConfig = {
      network: network.name,
      usdcAddress,
      treasuryAddress,
      ownerAddress: deployer.address,
    }

    await validateConfig(config)

    // Deploy contract
    const PuffPassRouter = await ethers.getContractFactory("PuffPassRouter")
    const router = await PuffPassRouter.deploy(config.usdcAddress, config.treasuryAddress)

    await router.deployed()

    console.log(`[v0] PuffPassRouter deployed to: ${router.address}`)
    console.log(`[v0] USDC address: ${config.usdcAddress}`)
    console.log(`[v0] Treasury address: ${config.treasuryAddress}`)

    // Save deployment info
    const deploymentInfo = {
      contractAddress: router.address,
      usdcAddress: config.usdcAddress,
      treasuryAddress: config.treasuryAddress,
      ownerAddress: config.ownerAddress,
      network: network.name,
      chainId: network.chainId,
      deploymentTimestamp: new Date().toISOString(),
    }

    const deploymentsDir = path.join(__dirname, "..", "deployments")
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true })
    }

    const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`)
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2))

    console.log(`[v0] Deployment info saved to: ${deploymentFile}`)
    console.log("[v0] Deployment completed successfully!")

    return deploymentInfo
  } catch (error) {
    console.error("[v0] Deployment failed:", error)
    process.exit(1)
  }
}

main().catch(console.error)
