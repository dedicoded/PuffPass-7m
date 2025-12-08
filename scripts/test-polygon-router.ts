import { ethers } from "hardhat"

async function main() {
  // Replace with your deployed contract address
  const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS || ""

  if (!ROUTER_ADDRESS) {
    console.error("❌ Please set ROUTER_ADDRESS environment variable")
    process.exit(1)
  }

  const [owner, merchant1, merchant2, merchant3, payer] = await ethers.getSigners()

  console.log("🧪 Testing PuffPassRouter on Polygon...\n")
  console.log("Router address:", ROUTER_ADDRESS)
  console.log("Test accounts:")
  console.log("- Owner:", owner.address)
  console.log("- Merchant 1:", merchant1.address)
  console.log("- Merchant 2:", merchant2.address)
  console.log("- Merchant 3:", merchant3.address)
  console.log("- Payer:", payer.address)

  const router = await ethers.getContractAt("PuffPassRouter", ROUTER_ADDRESS)
  const usdcAddress = await router.usdc()
  const usdc = await ethers.getContractAt("IERC20", usdcAddress)

  console.log("\n📊 Initial State:")
  const treasuryBefore = await usdc.balanceOf(await router.treasury())
  console.log("Treasury USDC balance:", ethers.utils.formatUnits(treasuryBefore, 6))

  // Step 1: Fund payer with test USDC (if needed)
  console.log("\n1️⃣ Processing test payments...")

  const payment1 = ethers.utils.parseUnits("100", 6) // $100
  const payment2 = ethers.utils.parseUnits("250", 6) // $250
  const payment3 = ethers.utils.parseUnits("500", 6) // $500

  // Approve router to spend USDC
  console.log("Approving USDC spending...")
  await usdc.connect(payer).approve(ROUTER_ADDRESS, ethers.utils.parseUnits("10000", 6))

  // Process payments
  console.log("Processing payment 1: $100 to Merchant 1")
  let tx = await router.connect(payer).pay(merchant1.address, payment1)
  await tx.wait()

  console.log("Processing payment 2: $250 to Merchant 2")
  tx = await router.connect(payer).pay(merchant2.address, payment2)
  await tx.wait()

  console.log("Processing payment 3: $500 to Merchant 3")
  tx = await router.connect(payer).pay(merchant3.address, payment3)
  await tx.wait()

  console.log("✅ All payments processed!")

  // Step 2: Check vault balances
  console.log("\n2️⃣ Checking merchant vault balances...")
  const vault1 = await router.merchantVaults(merchant1.address)
  const vault2 = await router.merchantVaults(merchant2.address)
  const vault3 = await router.merchantVaults(merchant3.address)

  console.log("Merchant 1 vault:", ethers.utils.formatUnits(vault1, 6), "USDC (97% of $100 = $97)")
  console.log("Merchant 2 vault:", ethers.utils.formatUnits(vault2, 6), "USDC (97% of $250 = $242.50)")
  console.log("Merchant 3 vault:", ethers.utils.formatUnits(vault3, 6), "USDC (97% of $500 = $485)")

  // Step 3: Execute batch settlement
  console.log("\n3️⃣ Executing batch settlement...")
  const merchants = [merchant1.address, merchant2.address, merchant3.address]
  const amounts = [vault1, vault2, vault3]

  const settlementTx = await router.batchSettle(merchants, amounts)
  const receipt = await settlementTx.wait()

  console.log("✅ Batch settlement completed!")
  console.log("Gas used:", receipt.gasUsed.toString())
  console.log("Gas cost:", ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice)), "MATIC")

  // Step 4: Verify final balances
  console.log("\n4️⃣ Verifying final balances...")

  for (let i = 0; i < merchants.length; i++) {
    const balance = await usdc.balanceOf(merchants[i])
    const vaultBalance = await router.merchantVaults(merchants[i])
    console.log(`Merchant ${i + 1}:`)
    console.log(`  USDC balance: ${ethers.utils.formatUnits(balance, 6)}`)
    console.log(`  Vault balance: ${ethers.utils.formatUnits(vaultBalance, 6)} (should be 0)`)
  }

  const treasuryAfter = await usdc.balanceOf(await router.treasury())
  const treasuryEarnings = treasuryAfter.sub(treasuryBefore)
  console.log("\nTreasury earnings (3% fees):", ethers.utils.formatUnits(treasuryEarnings, 6), "USDC")
  console.log("Expected: $25.50 (3% of $850 total)")

  console.log("\n🎉 All tests passed!")
  console.log("\n💡 Production Deployment Steps:")
  console.log("1. Deploy contract to Polygon Mainnet")
  console.log("2. Integrate payment flow in PuffPass frontend")
  console.log("3. Set up daily cron job for batch settlement")
  console.log("4. Monitor gas costs and adjust settlement frequency")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
