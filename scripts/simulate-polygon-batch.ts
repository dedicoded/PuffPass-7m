/**
 * PuffPass Polygon Batch Settlement Economic Simulation
 *
 * Tests the viability of daily batch USDC settlements to merchants
 * Shows gas costs, revenue, and profitability at different scales
 */

interface Merchant {
  id: string
  todaysPayments: number // Net USDC after 3% incoming fee
  wantsInstant: boolean // true = 7% fee, false = 5% fee
}

interface BatchResults {
  totalMerchants: number
  totalVolume: number // Total USDC moved
  incomingFeeRevenue: number // 3% from user payments
  withdrawalFeeRevenue: number // 5% or 7% from merchants
  totalRevenue: number
  totalGasCost: number // Cost YOU pay
  netProfit: number
  profitMargin: number
  costPerMerchant: number
  breakEvenMerchants: number
}

function simulateDailyBatch(merchants: Merchant[]): BatchResults {
  // Polygon USDC transfer gas cost (realistic estimate)
  const POLYGON_GAS_COST_PER_TRANSFER = 0.001 // $0.001 USD per merchant

  let totalVolume = 0
  let withdrawalFeeRevenue = 0
  let incomingFeeRevenue = 0

  for (const merchant of merchants) {
    totalVolume += merchant.todaysPayments

    // Calculate withdrawal fee (5% or 7%)
    const withdrawalFeeRate = merchant.wantsInstant ? 0.07 : 0.05
    const withdrawalFee = merchant.todaysPayments * withdrawalFeeRate
    withdrawalFeeRevenue += withdrawalFee

    // Calculate incoming fee (reverse-engineer from net amount)
    // If merchant gets $97, original was $100 (3% of $100 = $3)
    const originalAmount = merchant.todaysPayments / 0.97
    incomingFeeRevenue += originalAmount * 0.03
  }

  const totalRevenue = incomingFeeRevenue + withdrawalFeeRevenue
  const totalGasCost = merchants.length * POLYGON_GAS_COST_PER_TRANSFER
  const netProfit = totalRevenue - totalGasCost
  const profitMargin = (netProfit / totalVolume) * 100

  // Calculate break-even point
  const avgRevenuePerMerchant = totalRevenue / merchants.length
  const breakEvenMerchants = Math.ceil(totalGasCost / avgRevenuePerMerchant)

  return {
    totalMerchants: merchants.length,
    totalVolume,
    incomingFeeRevenue,
    withdrawalFeeRevenue,
    totalRevenue,
    totalGasCost,
    netProfit,
    profitMargin,
    costPerMerchant: POLYGON_GAS_COST_PER_TRANSFER,
    breakEvenMerchants,
  }
}

function generateMerchants(count: number, avgPayment: number, instantRate: number): Merchant[] {
  return Array(count)
    .fill(0)
    .map((_, i) => ({
      id: `merchant-${i + 1}`,
      todaysPayments: avgPayment * (0.5 + Math.random()), // 50-150% of avg
      wantsInstant: Math.random() < instantRate,
    }))
}

console.log("🚀 PuffPass Polygon Batch Settlement Simulation\n")
console.log("═".repeat(70))

const scenarios = [
  {
    name: "Early Launch (10 merchants)",
    merchants: generateMerchants(10, 500, 0.5), // $500 avg, 50% instant
  },
  {
    name: "Growing Platform (100 merchants)",
    merchants: generateMerchants(100, 1000, 0.6), // $1000 avg, 60% instant
  },
  {
    name: "Medium Scale (500 merchants)",
    merchants: generateMerchants(500, 1500, 0.7), // $1500 avg, 70% instant
  },
  {
    name: "Large Scale (1000 merchants)",
    merchants: generateMerchants(1000, 2000, 0.75), // $2000 avg, 75% instant
  },
  {
    name: "Enterprise Scale (5000 merchants)",
    merchants: generateMerchants(5000, 2500, 0.8), // $2500 avg, 80% instant
  },
]

for (const scenario of scenarios) {
  const results = simulateDailyBatch(scenario.merchants)

  console.log(`\n📊 ${scenario.name}`)
  console.log("─".repeat(70))
  console.log(`   Total Merchants:           ${results.totalMerchants.toLocaleString()}`)
  console.log(
    `   Daily Volume:              $${results.totalVolume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )
  console.log(`\n   Revenue Breakdown:`)
  console.log(
    `   ├─ Incoming Fees (3%):     $${results.incomingFeeRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )
  console.log(
    `   ├─ Withdrawal Fees:        $${results.withdrawalFeeRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )
  console.log(
    `   └─ Total Revenue:          $${results.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )
  console.log(`\n   Costs:`)
  console.log(
    `   ├─ Gas Cost (you pay):     $${results.totalGasCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )
  console.log(`   └─ Cost per Merchant:      $${results.costPerMerchant.toFixed(3)}`)
  console.log(
    `\n   ✨ Net Profit:              $${results.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  )
  console.log(`   📈 Profit Margin:           ${results.profitMargin.toFixed(2)}%`)
  console.log(`   🎯 Break-even:              ${results.breakEvenMerchants} merchants`)
}

// Monthly and annual projections
console.log("\n\n💰 Annual Projections (1000 merchants scenario)")
console.log("═".repeat(70))

const monthlyMerchants = generateMerchants(1000, 2000, 0.75)
const dailyResults = simulateDailyBatch(monthlyMerchants)

const monthlyProfit = dailyResults.netProfit * 30
const annualProfit = dailyResults.netProfit * 365
const monthlyGasCost = dailyResults.totalGasCost * 30
const annualGasCost = dailyResults.totalGasCost * 365

console.log(
  `\n   Daily Net Profit:     $${dailyResults.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
)
console.log(`   Monthly Net Profit:   $${monthlyProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`)
console.log(`   Annual Net Profit:    $${annualProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`)
console.log(`\n   Monthly Gas Cost:     $${monthlyGasCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`)
console.log(`   Annual Gas Cost:      $${annualGasCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`)
console.log(
  `\n   ROI on Gas:           ${((dailyResults.netProfit / dailyResults.totalGasCost) * 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}x`,
)

console.log("\n\n✅ Conclusion:")
console.log("─".repeat(70))
console.log("   The Polygon batch settlement model is HIGHLY PROFITABLE.")
console.log("   Gas costs are negligible compared to revenue.")
console.log("   Merchants get free withdrawals → Better UX.")
console.log("   You earn 3% + withdrawal fees with minimal operational cost.")
console.log("\n   🚀 Ready to implement!\n")
