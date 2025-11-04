const hre = require("hardhat")

async function main() {
  console.log("🪙 Deploying PUFF Token...\n")

  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying with account:", deployer.address)

  const PuffToken = await hre.ethers.getContractFactory("PuffToken")
  const puffToken = await PuffToken.deploy()
  await puffToken.deployed()

  console.log("✅ PUFF Token deployed to:", puffToken.address)
  console.log("\n📝 Add to .env:")
  console.log(`NEXT_PUBLIC_PUFF_TOKEN_ADDRESS=${puffToken.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
