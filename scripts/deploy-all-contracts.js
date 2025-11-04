const hre = require("hardhat")

async function main() {
  console.log("🚀 Deploying PuffPass Smart Contracts...\n")

  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString(), "\n")

  // 1. Deploy PUFF Token
  console.log("📝 Deploying PUFF Token...")
  const PuffToken = await hre.ethers.getContractFactory("PuffToken")
  const puffToken = await PuffToken.deploy()
  await puffToken.deployed()
  console.log("✅ PUFF Token deployed to:", puffToken.address, "\n")

  // 2. Deploy Compliance Contract
  console.log("📝 Deploying Compliance Contract...")
  const ComplianceContract = await hre.ethers.getContractFactory("ComplianceContract")
  const complianceContract = await ComplianceContract.deploy()
  await complianceContract.deployed()
  console.log("✅ Compliance Contract deployed to:", complianceContract.address, "\n")

  // 3. Deploy Merchant Processor
  console.log("📝 Deploying Merchant Processor...")

  // You'll need to provide these addresses
  const USDC_ADDRESS = process.env.USDC_TOKEN_ADDRESS || "0x..." // Update with actual USDC address
  const PLATFORM_TREASURY = process.env.PLATFORM_TREASURY_ADDRESS || deployer.address
  const PUFF_VAULT = process.env.PUFF_VAULT_ADDRESS || deployer.address

  const MerchantProcessor = await hre.ethers.getContractFactory("MerchantProcessor")
  const merchantProcessor = await MerchantProcessor.deploy(
    USDC_ADDRESS,
    puffToken.address,
    complianceContract.address,
    PLATFORM_TREASURY,
    PUFF_VAULT,
  )
  await merchantProcessor.deployed()
  console.log("✅ Merchant Processor deployed to:", merchantProcessor.address, "\n")

  // 4. Deploy Redemption Contract
  console.log("📝 Deploying Redemption Contract...")
  const PuffPassRedemption = await hre.ethers.getContractFactory("PuffPassRedemption")
  const redemptionContract = await PuffPassRedemption.deploy(puffToken.address, USDC_ADDRESS)
  await redemptionContract.deployed()
  console.log("✅ Redemption Contract deployed to:", redemptionContract.address, "\n")

  // 5. Grant roles
  console.log("🔐 Setting up roles...")

  // Grant MINTER_ROLE to MerchantProcessor
  const MINTER_ROLE = await puffToken.MINTER_ROLE()
  await puffToken.grantRole(MINTER_ROLE, merchantProcessor.address)
  console.log("✅ Granted MINTER_ROLE to Merchant Processor")

  // Grant PROCESSOR_ROLE to deployer (you can change this later)
  const PROCESSOR_ROLE = await merchantProcessor.PROCESSOR_ROLE()
  await merchantProcessor.grantRole(PROCESSOR_ROLE, deployer.address)
  console.log("✅ Granted PROCESSOR_ROLE to deployer")

  // Grant VERIFIER_ROLE to deployer (you can change this later)
  const VERIFIER_ROLE = await complianceContract.VERIFIER_ROLE()
  await complianceContract.grantRole(VERIFIER_ROLE, deployer.address)
  console.log("✅ Granted VERIFIER_ROLE to deployer\n")

  // Print summary
  console.log("📋 Deployment Summary:")
  console.log("=".repeat(60))
  console.log("PUFF Token:           ", puffToken.address)
  console.log("Compliance Contract:  ", complianceContract.address)
  console.log("Merchant Processor:   ", merchantProcessor.address)
  console.log("Redemption Contract:  ", redemptionContract.address)
  console.log("=".repeat(60))
  console.log("\n📝 Add these to your .env file:")
  console.log(`NEXT_PUBLIC_PUFF_TOKEN_ADDRESS=${puffToken.address}`)
  console.log(`NEXT_PUBLIC_COMPLIANCE_CONTRACT_ADDRESS=${complianceContract.address}`)
  console.log(`NEXT_PUBLIC_MERCHANT_PROCESSOR_ADDRESS=${merchantProcessor.address}`)
  console.log(`NEXT_PUBLIC_REDEMPTION_CONTRACT_ADDRESS=${redemptionContract.address}`)
  console.log("\n✅ All contracts deployed successfully!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
