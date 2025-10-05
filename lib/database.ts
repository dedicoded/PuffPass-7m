"use server"

import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

export function getSql() {
  if (_sql === null) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set")
    }
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

// Database query helpers for live data
export async function getConsumerBalance(userId: string) {
  const sql = getSql()
  const result = await sql`
    SELECT 
      COALESCE(SUM(points), 0) as total_points,
      COUNT(*) as transaction_count
    FROM puff_points 
    WHERE user_id = ${userId} 
    AND (expires_at IS NULL OR expires_at > NOW())
  `
  return result[0]
}

export async function getConsumerRewards(userId: string) {
  const sql = getSql()
  const result = await sql`
    SELECT 
      rc.*,
      mp.business_name as merchant_name
    FROM rewards_catalog rc
    JOIN merchant_profiles mp ON rc.merchant_id = mp.id
    WHERE rc.is_active = true
    AND rc.availability_count > 0
    ORDER BY rc.points_cost ASC
  `
  return result
}

export async function getConsumerActivity(userId: string, limit = 10) {
  const sql = getSql()
  const result = await sql`
    SELECT 
      pp.points,
      pp.transaction_type,
      pp.description,
      pp.created_at,
      mp.business_name as merchant_name
    FROM puff_points pp
    LEFT JOIN orders o ON pp.order_id = o.id
    LEFT JOIN merchant_profiles mp ON o.merchant_id = mp.id
    WHERE pp.user_id = ${userId}
    ORDER BY pp.created_at DESC
    LIMIT ${limit}
  `
  return result
}

export async function getMerchantContributions(merchantId: string) {
  const sql = getSql()
  const result = await sql`
    SELECT 
      COALESCE(SUM(contribution_to_vault), 0) as total_vault_contribution,
      COALESCE(SUM(contribution_to_rewards), 0) as total_rewards_funded,
      COUNT(*) as transaction_count
    FROM merchant_fee_contributions 
    WHERE merchant_id = ${merchantId}
  `
  return result[0]
}

export async function getMerchantLeaderboard() {
  const sql = getSql()
  const result = await sql`
    SELECT 
      mp.business_name,
      mp.id as merchant_id,
      COALESCE(SUM(mfc.fee_amount), 0) as fees_paid,
      COALESCE(SUM(mfc.contribution_to_rewards), 0) as points_funded,
      COUNT(DISTINCT rr.id) as redemptions_driven
    FROM merchant_profiles mp
    LEFT JOIN merchant_fee_contributions mfc ON mp.id = mfc.merchant_id
    LEFT JOIN rewards_catalog rc ON mp.id = rc.merchant_id
    LEFT JOIN reward_redemptions rr ON rc.id = rr.reward_id
    WHERE mp.status = 'approved'
    GROUP BY mp.id, mp.business_name
    ORDER BY fees_paid DESC
    LIMIT 10
  `
  return result
}

export async function getVaultSnapshot() {
  const sql = getSql()
  const result = await sql`
    SELECT 
      total_balance,
      float_balance,
      rewards_pool_balance,
      merchant_contributions,
      reserve_ratio,
      last_updated
    FROM puff_vault_balances 
    ORDER BY last_updated DESC 
    LIMIT 1
  `
  return result[0]
}

export async function getYieldForecast() {
  const sql = getSql()
  const result = await sql`
    SELECT 
      fa.allocation_type,
      fa.allocated_amount,
      fa.allocation_percentage,
      fa.current_apy,
      fa.target_apy,
      COALESCE(AVG(yg.apy_achieved), fa.current_apy) as avg_apy_achieved
    FROM float_allocations fa
    LEFT JOIN yield_generation yg ON fa.id = yg.allocation_id
    WHERE yg.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY fa.id, fa.allocation_type, fa.allocated_amount, fa.allocation_percentage, fa.current_apy, fa.target_apy
  `
  return result
}
