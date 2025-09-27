// SLA Compliance Calculator
// Transforms raw Web3 health metrics into business-tier compliance scores

export interface SLATier {
  name: string
  uptime: number
  errorRate: number
  latencyAvg: number
  latencyMax: number
}

export interface SLACompliance {
  tier: string
  uptimeCompliance: boolean
  errorRateCompliance: boolean
  latencyCompliance: boolean
  overallCompliance: boolean
  creditOwed: number
}

export const SLA_TIERS: Record<string, SLATier> = {
  bronze: {
    name: "Bronze - Standard",
    uptime: 99.0,
    errorRate: 5.0,
    latencyAvg: 1000,
    latencyMax: 3000,
  },
  silver: {
    name: "Silver - Professional",
    uptime: 99.5,
    errorRate: 2.0,
    latencyAvg: 750,
    latencyMax: 2000,
  },
  gold: {
    name: "Gold - Enterprise",
    uptime: 99.9,
    errorRate: 1.0,
    latencyAvg: 500,
    latencyMax: 1500,
  },
}

export const SLA_CREDITS = {
  bronze: 0.05, // 5% credit
  silver: 0.1, // 10% credit
  gold: 0.25, // 25% credit
}

export function calculateSLACompliance(
  tier: string,
  metrics: {
    uptime: number
    errorRate: number
    latencyAvg: number
    latencyMax: number
  },
): SLACompliance {
  const sla = SLA_TIERS[tier]
  if (!sla) throw new Error(`Unknown SLA tier: ${tier}`)

  const uptimeCompliance = metrics.uptime >= sla.uptime
  const errorRateCompliance = metrics.errorRate <= sla.errorRate
  const latencyCompliance = metrics.latencyAvg <= sla.latencyAvg && metrics.latencyMax <= sla.latencyMax

  const overallCompliance = uptimeCompliance && errorRateCompliance && latencyCompliance

  const creditOwed = overallCompliance ? 0 : SLA_CREDITS[tier as keyof typeof SLA_CREDITS]

  return {
    tier,
    uptimeCompliance,
    errorRateCompliance,
    latencyCompliance,
    overallCompliance,
    creditOwed,
  }
}

export function generateSLAReport(
  period: "daily" | "weekly" | "monthly",
  metrics: {
    uptime: number
    errorRate: number
    latencyAvg: number
    latencyMax: number
  },
) {
  const tiers = Object.keys(SLA_TIERS)
  const report = tiers.map((tier) => {
    const compliance = calculateSLACompliance(tier, metrics)
    const { tier: _, ...complianceWithoutTier } = compliance
    return {
      tier: SLA_TIERS[tier].name,
      ...complianceWithoutTier,
      period,
    }
  })

  return {
    period,
    timestamp: new Date().toISOString(),
    tiers: report,
    totalCreditsOwed: report.reduce((sum, t) => sum + t.creditOwed, 0),
  }
}
