const hre = require("hardhat")

async function main() {
  const [deployer] = await hre.ethers.getSigners()

  console.log("Deploying PuffPassRedemption with account:", deployer.address)
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString())

  // Contract addresses (update these for your network)
  const PUFF_TOKEN_ADDRESS = process.env.PUFF_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000"
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" // Mainnet USDC

  console.log("\nDeployment Configuration:")
  console.log("PUFF Token:", PUFF_TOKEN_ADDRESS)
  console.log("USDC Token:", USDC_ADDRESS)

  // Deploy contract
  const PuffPassRedemption = await hre.ethers.getContractFactory("PuffPassRedemption")
  const redemption = await PuffPassRedemption.deploy(PUFF_TOKEN_ADDRESS, USDC_ADDRESS)

  await redemption.waitForDeployment()
  const address = await redemption.getAddress()

  console.log("\n✅ PuffPassRedemption deployed to:", address)
  console.log("\nNext steps:")
  console.log("1. Add REDEMPTION_CONTRACT_ADDRESS=" + address + " to .env")
  console.log("2. Fund the vault with USDC using fundVault()")
  console.log("3. Grant VAULT_MANAGER_ROLE to admin wallets")

  // Save deployment info
  const fs = require("fs")
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    puffToken: PUFF_TOKEN_ADDRESS,
    usdcToken: USDC_ADDRESS,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  }

  fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2))
  console.log("\n📝 Deployment info saved to deployment-info.json")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
