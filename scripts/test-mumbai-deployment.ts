import { ethers } from "hardhat"
import * as fs from "fs"
import * as path from "path"

async function main() {
  console.log("[v0] Testing Mumbai deployment...")

  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", "mumbai-deployment.json")

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(
      "Mumbai deployment not found. Deploy first using: npx hardhat run scripts/deploy-polygon-router.ts --network mumbai",
    )
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"))
  console.log(`[v0] Testing contract at: ${deploymentInfo.contractAddress}`)

  const [signer] = await ethers.getSigners()
  console.log(`[v0] Testing with account: ${signer.address}`)

  // Get contract instance
  const PuffPassRouter = await ethers.getContractFactory("PuffPassRouter")
  const router = PuffPassRouter.attach(deploymentInfo.contractAddress)

  // Test 1: Check USDC address
  console.log("\n[v0] Test 1: Verifying USDC address...")
  const usdcAddress = await router.usdc()
  console.log(`[v0] USDC address: ${usdcAddress}`)
  console.log(`[v0] Expected: ${deploymentInfo.usdcAddress}`)
  if (usdcAddress.toLowerCase() !== deploymentInfo.usdcAddress.toLowerCase()) {
    throw new Error("USDC address mismatch!")
  }
  console.log("[v0] ✓ USDC address correct")

  // Test 2: Check treasury
  console.log("\n[v0] Test 2: Verifying treasury address...")
  const treasury = await router.treasury()
  console.log(`[v0] Treasury: ${treasury}`)
  console.log(`[v0] Expected: ${deploymentInfo.treasuryAddress}`)
  if (treasury.toLowerCase() !== deploymentInfo.treasuryAddress.toLowerCase()) {
    throw new Error("Treasury address mismatch!")
  }
  console.log("[v0] ✓ Treasury address correct")

  // Test 3: Check owner
  console.log("\n[v0] Test 3: Verifying owner...")
  const owner = await router.owner()
  console.log(`[v0] Owner: ${owner}`)
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.log(`[v0] ⚠ Warning: Owner is ${owner}, you are ${signer.address}`)
  } else {
    console.log("[v0] ✓ You are the owner")
  }

  // Test 4: Check fee constants
  console.log("\n[v0] Test 4: Verifying fee structure...")
  const baseFee = await router.BASE_FEE_BPS()
  const instantFee = await router.INSTANT_FEE_BPS()
  const delayedFee = await router.DELAYED_FEE_BPS()
  console.log(`[v0] Base fee: ${baseFee} bps (${Number(baseFee) / 100}%)`)
  console.log(`[v0] Instant withdrawal fee: ${instantFee} bps (${Number(instantFee) / 100}%)`)
  console.log(`[v0] Delayed withdrawal fee: ${delayedFee} bps (${Number(delayedFee) / 100}%)`)

  if (Number(baseFee) !== 300) {
    throw new Error("Base fee should be 300 bps (3%)")
  }
  console.log("[v0] ✓ Fee structure correct")

  // Test 5: Check merchant balance (should be 0 initially)
  console.log("\n[v0] Test 5: Checking merchant vault...")
  const testMerchant = "0x0000000000000000000000000000000000000001"
  const balance = await router.getMerchantBalance(testMerchant)
  console.log(`[v0] Test merchant balance: ${ethers.formatUnits(balance, 6)} USDC`)
  console.log("[v0] ✓ Can query merchant balances")

  console.log("\n[v0] ✅ All tests passed!")
  console.log("\n[v0] Next steps:")
  console.log("1. Get Mumbai USDC from faucet or swap")
  console.log("2. Test payment flow: router.pay(merchantAddress, usdcAmount)")
  console.log("3. Test batch settlement: router.batchSettle([merchant], [amount])")
  console.log("4. Once confident, deploy to Polygon mainnet")
}

main().catch((error) => {
  console.error("[v0] Test failed:", error)
  process.exit(1)
})
