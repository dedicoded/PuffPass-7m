import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("Deploying PuffPassRouter with account:", deployer.address)
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()))

  // Polygon Mumbai USDC (testnet)
  const USDC_MUMBAI = "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"

  // Polygon Mainnet USDC (production)
  const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"

  const network = await ethers.provider.getNetwork()
  const isMainnet = network.chainId === 137

  const usdcAddress = isMainnet ? USDC_POLYGON : USDC_MUMBAI
  const treasuryAddress = deployer.address // Change this to your treasury wallet

  console.log(`\nDeploying to ${isMainnet ? "Polygon Mainnet" : "Mumbai Testnet"}`)
  console.log("USDC address:", usdcAddress)
  console.log("Treasury address:", treasuryAddress)

  const PuffPassRouter = await ethers.getContractFactory("PuffPassRouter")
  const router = await PuffPassRouter.deploy(usdcAddress, treasuryAddress)

  await router.deployed()

  console.log("\n✅ Deployment successful!")
  console.log("PuffPassRouter deployed to:", router.address)
  console.log("\nVerify on PolygonScan:")
  console.log(
    `npx hardhat verify --network ${isMainnet ? "polygon" : "mumbai"} ${router.address} ${usdcAddress} ${treasuryAddress}`,
  )

  // Save deployment info
  const deploymentInfo = {
    network: isMainnet ? "polygon" : "mumbai",
    routerAddress: router.address,
    usdcAddress: usdcAddress,
    treasuryAddress: treasuryAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  }

  console.log("\nDeployment Info:")
  console.log(JSON.stringify(deploymentInfo, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
