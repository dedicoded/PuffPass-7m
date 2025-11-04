const hre = require("hardhat")

async function main() {
  console.log("🛡️ Deploying Compliance Contract...\n")

  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying with account:", deployer.address)

  const ComplianceContract = await hre.ethers.getContractFactory("ComplianceContract")
  const complianceContract = await ComplianceContract.deploy()
  await complianceContract.deployed()

  console.log("✅ Compliance Contract deployed to:", complianceContract.address)
  console.log("\n📝 Add to .env:")
  console.log(`NEXT_PUBLIC_COMPLIANCE_CONTRACT_ADDRESS=${complianceContract.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
