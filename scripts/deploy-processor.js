const hre = require("hardhat")

async function main() {
  console.log("💳 Deploying Merchant Processor...\n")

  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying with account:", deployer.address)

  // Required addresses
  const USDC_ADDRESS = process.env.USDC_TOKEN_ADDRESS
  const PUFF_TOKEN_ADDRESS = process.env.PUFF_TOKEN_ADDRESS
  const COMPLIANCE_ADDRESS = process.env.COMPLIANCE_CONTRACT_ADDRESS
  const TREASURY = process.env.PLATFORM_TREASURY_ADDRESS || deployer.address
  const VAULT = process.env.PUFF_VAULT_ADDRESS || deployer.address

  if (!USDC_ADDRESS || !PUFF_TOKEN_ADDRESS || !COMPLIANCE_ADDRESS) {
    throw new Error("Missing required contract addresses. Deploy dependencies first.")
  }

  const MerchantProcessor = await hre.ethers.getContractFactory("MerchantProcessor")
  const processor = await MerchantProcessor.deploy(
    USDC_ADDRESS,
    PUFF_TOKEN_ADDRESS,
    COMPLIANCE_ADDRESS,
    TREASURY,
    VAULT,
  )
  await processor.deployed()

  console.log("✅ Merchant Processor deployed to:", processor.address)
  console.log("\n📝 Add to .env:")
  console.log(`MERCHANT_PROCESSOR_ADDRESS=${processor.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
