import { ethers } from "ethers"
import fs from "fs"
import path from "path"

async function main() {
  const network = process.env.DEPLOY_NETWORK || "mumbai"
  const isMainnet = network === "polygon"

  console.log(`\n🚀 Deploying PuffPassRouter to ${network.toUpperCase()}...\n`)

  // Network configurations
  const networks = {
    mumbai: {
      rpc: process.env.POLYGON_MUMBAI_RPC || "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      usdcAddress: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23", // USDC on Mumbai
      explorer: "https://mumbai.polygonscan.com",
    },
    polygon: {
      rpc: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      chainId: 137,
      usdcAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
      explorer: "https://polygonscan.com",
    },
  }

  const config = networks[network]
  if (!config) {
    throw new Error(`Unknown network: ${network}`)
  }

  // Check private key
  const privateKey = process.env.POLYGON_PRIVATE_KEY
  if (!privateKey) {
    throw new Error("❌ POLYGON_PRIVATE_KEY not found in environment variables")
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(config.rpc)
  const wallet = new ethers.Wallet(privateKey, provider)

  console.log("📍 Deployer address:", wallet.address)

  // Check balance
  const balance = await provider.getBalance(wallet.address)
  const balanceInMatic = ethers.formatEther(balance)
  console.log("💰 Balance:", balanceInMatic, "MATIC")

  if (Number.parseFloat(balanceInMatic) < 0.1) {
    throw new Error(`❌ Insufficient balance. Need at least 0.1 MATIC, have ${balanceInMatic}`)
  }

  // Mainnet safety check
  if (isMainnet) {
    console.log("\n⚠️  MAINNET DEPLOYMENT - This will use real MATIC!")
    console.log("Press Ctrl+C within 5 seconds to cancel...\n")
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  // Compile contract
  console.log("\n📦 Compiling contract...")
  const contractSource = fs.readFileSync("contracts/PuffPassRouter.sol", "utf8")

  // Deploy contract
  console.log("🔨 Deploying contract...")

  const contractFactory = new ethers.ContractFactory(PuffPassRouterABI, PuffPassRouterBytecode, wallet)

  const contract = await contractFactory.deploy(
    config.usdcAddress,
    wallet.address, // treasury address
  )

  console.log("⏳ Waiting for deployment...")
  await contract.waitForDeployment()

  const contractAddress = await contract.getAddress()

  console.log("\n✅ Contract deployed successfully!")
  console.log("📍 Address:", contractAddress)
  console.log("🔍 Explorer:", `${config.explorer}/address/${contractAddress}`)

  // Save deployment info
  const deploymentInfo = {
    network,
    contractAddress,
    deployerAddress: wallet.address,
    usdcAddress: config.usdcAddress,
    chainId: config.chainId,
    deployedAt: new Date().toISOString(),
    explorerUrl: `${config.explorer}/address/${contractAddress}`,
  }

  const deploymentPath = path.join("deployments", `${network}.json`)
  fs.mkdirSync("deployments", { recursive: true })
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2))

  console.log("\n📄 Deployment info saved to:", deploymentPath)

  // Update .env.example
  console.log("\n📝 Add this to your environment variables:")
  console.log(`NEXT_PUBLIC_PUFFPASS_ROUTER_ADDRESS=${contractAddress}`)

  return deploymentInfo
}

// ABI and Bytecode (you'll need to compile the contract first)
const PuffPassRouterABI = [
  "constructor(address _usdc, address _treasury)",
  "function pay(address merchant, uint256 amount) external returns (uint256 netAmount)",
  "function withdrawFees() external",
  "function usdc() external view returns (address)",
  "function treasury() external view returns (address)",
  "function feePercentage() external view returns (uint256)",
]

const PuffPassRouterBytecode = "0x" // Replace with actual bytecode after compilation

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message)
    process.exit(1)
  })
