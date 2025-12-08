/**
 * Test script for PuffPass fee calculations
 *
 * Fee Structure:
 * - 3% on incoming user payments (taken upfront)
 * - 7% on instant withdrawals (from vault balance)
 * - 5% on delayed withdrawals after 3-5 days (from vault balance)
 */

// Test scenarios
const testScenarios = [
  { userPayment: 100, label: "$100 payment" },
  { userPayment: 50, label: "$50 payment" },
  { userPayment: 1000, label: "$1000 payment" },
  { userPayment: 25.5, label: "$25.50 payment" },
]

function calculateIncomingFee(amount: number): {
  grossAmount: number
  incomingFee: number
  netToVault: number
} {
  const incomingFee = amount * 0.03 // 3%
  const netToVault = amount - incomingFee

  return {
    grossAmount: amount,
    incomingFee,
    netToVault,
  }
}

function calculateInstantWithdrawal(vaultBalance: number): {
  vaultBalance: number
  withdrawalFee: number
  netToMerchant: number
  totalPuffPassRevenue: number
} {
  const withdrawalFee = vaultBalance * 0.07 // 7%
  const netToMerchant = vaultBalance - withdrawalFee

  return {
    vaultBalance,
    withdrawalFee,
    netToMerchant,
    totalPuffPassRevenue: withdrawalFee,
  }
}

function calculateDelayedWithdrawal(vaultBalance: number): {
  vaultBalance: number
  withdrawalFee: number
  netToMerchant: number
  totalPuffPassRevenue: number
} {
  const withdrawalFee = vaultBalance * 0.05 // 5%
  const netToMerchant = vaultBalance - withdrawalFee

  return {
    vaultBalance,
    withdrawalFee,
    netToMerchant,
    totalPuffPassRevenue: withdrawalFee,
  }
}

// Run tests
console.log("\n🧪 PuffPass Fee Calculation Tests\n")
console.log("=".repeat(80))

testScenarios.forEach((scenario) => {
  console.log(`\n📊 Scenario: ${scenario.label}`)
  console.log("-".repeat(80))

  // Step 1: User pays merchant
  const incoming = calculateIncomingFee(scenario.userPayment)
  console.log("\n1️⃣  User Payment (3% incoming fee)")
  console.log(`   User pays:           $${incoming.grossAmount.toFixed(2)}`)
  console.log(`   PuffPass fee (3%):   $${incoming.incomingFee.toFixed(2)}`)
  console.log(`   ✅ Merchant vault:   $${incoming.netToVault.toFixed(2)}`)

  // Step 2A: Instant withdrawal
  const instant = calculateInstantWithdrawal(incoming.netToVault)
  console.log("\n2️⃣A Instant Withdrawal (7% fee)")
  console.log(`   Vault balance:       $${instant.vaultBalance.toFixed(2)}`)
  console.log(`   Withdrawal fee (7%): $${instant.withdrawalFee.toFixed(2)}`)
  console.log(`   ✅ Merchant gets:    $${instant.netToMerchant.toFixed(2)}`)
  console.log(
    `   💰 Total PuffPass:   $${(incoming.incomingFee + instant.withdrawalFee).toFixed(2)} (${(((incoming.incomingFee + instant.withdrawalFee) / scenario.userPayment) * 100).toFixed(2)}%)`,
  )

  // Step 2B: Delayed withdrawal
  const delayed = calculateDelayedWithdrawal(incoming.netToVault)
  console.log("\n2️⃣B Delayed Withdrawal (5% fee after 3 days)")
  console.log(`   Vault balance:       $${delayed.vaultBalance.toFixed(2)}`)
  console.log(`   Withdrawal fee (5%): $${delayed.withdrawalFee.toFixed(2)}`)
  console.log(`   ✅ Merchant gets:    $${delayed.netToMerchant.toFixed(2)}`)
  console.log(
    `   💰 Total PuffPass:   $${(incoming.incomingFee + delayed.withdrawalFee).toFixed(2)} (${(((incoming.incomingFee + delayed.withdrawalFee) / scenario.userPayment) * 100).toFixed(2)}%)`,
  )

  console.log("\n" + "=".repeat(80))
})

// Summary
console.log("\n📈 Fee Structure Summary")
console.log("=".repeat(80))
console.log("✅ Users pay:           $0 (no fees)")
console.log("✅ Merchants pay:       3% on incoming + 5-7% on withdrawal")
console.log("✅ PuffPass earns:      7.85% (delayed) or 9.79% (instant)")
console.log("✅ All transactions:    USDC only (no fiat)")
console.log("✅ Gas fees:            Paid by PuffPass (merchants get free USDC)")
console.log("=".repeat(80) + "\n")

// Export functions for use in production
export { calculateIncomingFee, calculateInstantWithdrawal, calculateDelayedWithdrawal }
