import { neon } from "@neondatabase/serverless"

let _sql: any | null = null

function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set")
    }
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

export { getSql }

export interface User {
  id: string
  email: string
  name: string
  role: "customer" | "merchant" | "admin"
  wallet_address?: string
  patient_certification?: boolean
  dc_residency?: boolean
  referral_code?: string
  created_at: string
  updated_at: string
  auth_method?: "password" | "wallet" | "passkey"
  embedded_wallet?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category: string
  strain_type?: string
  thc_percentage?: number
  cbd_percentage?: number
  price_per_unit: number
  unit_type: string
  merchant_id: string
  stock_quantity: number
  metrc_id?: string
  lab_tested: boolean
  lab_results?: any
  status: "active" | "inactive" | "out_of_stock"
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  merchant_id: string
  total_amount: number
  tax_amount: number
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled"
  payment_method: string
  payment_status: string
  delivery_method?: string
  delivery_address?: any
  notes?: string
  metrc_manifest_id?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface MerchantProfile {
  id: string
  user_id: string
  business_name: string
  license_number: string
  license_type?: string
  business_address: any
  phone?: string
  email?: string
  metrc_facility_id?: string
  approval_status: "pending" | "approved" | "rejected" | "suspended"
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface ApprovalWorkflow {
  id: string
  workflow_type: string
  entity_id: string
  entity_type: string
  status: "pending" | "approved" | "rejected"
  requested_by: string
  assigned_to?: string
  approved_by?: string
  rejection_reason?: string
  notes?: string
  created_at: string
  updated_at: string
}

export async function createUser({
  name,
  email,
  password,
  role = "customer",
  walletAddress,
  patientCertification,
  dcResidency,
  referralCode,
  authMethod = "password",
  embeddedWallet,
}: {
  name: string
  email: string
  password: string
  role?: "customer" | "merchant" | "admin"
  walletAddress?: string
  patientCertification?: boolean
  dcResidency?: boolean
  referralCode?: string
  authMethod?: "password" | "wallet" | "passkey"
  embeddedWallet?: string
}): Promise<User> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "users")

  if (!email || email.trim() === "") {
    throw new Error("Email is required and cannot be empty")
  }

  if (!role || !["customer", "merchant", "admin"].includes(role)) {
    throw new Error("Valid role is required")
  }

  if (authMethod === "password" && (!password || password.trim() === "")) {
    throw new Error("Password is required for password authentication")
  }

  try {
    console.log("[v0] Creating user with auth method:", authMethod)

    const result = await sql`
      INSERT INTO users (name, email, password, role, wallet_address, patient_certification, dc_residency, referral_code, auth_method, embedded_wallet)
      VALUES (
        ${name.trim()}, 
        ${email.trim().toLowerCase()}, 
        ${password || null},
        ${role},
        ${walletAddress || null},
        ${patientCertification},
        ${dcResidency},
        ${referralCode || null},
        ${authMethod},
        ${embeddedWallet || null}
      )
      RETURNING id, name, email, role, wallet_address, patient_certification, dc_residency, referral_code, created_at, updated_at, auth_method, embedded_wallet
    `

    console.log("[v0] User inserted successfully, result:", result[0])
    const dbUser = result[0]

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      wallet_address: dbUser.wallet_address,
      patient_certification: dbUser.patient_certification,
      dc_residency: dbUser.dc_residency,
      referral_code: dbUser.referral_code,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at,
      auth_method: dbUser.auth_method,
      embedded_wallet: dbUser.embedded_wallet,
    }

    console.log("[v0] User object created:", user)
    return user
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "users")

  if (!email || typeof email !== "string" || email.trim() === "") {
    console.log("[v0] getUserByEmail called with invalid email:", email)
    return null
  }

  try {
    const normalizedEmail = email.trim().toLowerCase()
    console.log("[v0] Looking up user by email:", normalizedEmail)

    const result = await sql`
      SELECT id, name, email, role, wallet_address, patient_certification, dc_residency, referral_code, created_at, updated_at, auth_method, embedded_wallet
      FROM users 
      WHERE email = ${normalizedEmail}
    `

    if (result.length === 0) {
      console.log("[v0] No user found with email:", normalizedEmail)
      return null
    }

    const user = result[0]

    const foundUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      wallet_address: user.wallet_address,
      patient_certification: user.patient_certification,
      dc_residency: user.dc_residency,
      referral_code: user.referral_code,
      created_at: user.created_at,
      updated_at: user.updated_at,
      auth_method: user.auth_method,
      embedded_wallet: user.embedded_wallet,
    }

    console.log("[v0] User found:", { ...foundUser, role: foundUser.role })
    return foundUser
  } catch (error) {
    console.error("[v0] Error in getUserByEmail:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "users")

  if (!id || typeof id !== "string" || id.trim() === "") {
    console.log("[v0] getUserById called with invalid id:", id)
    return null
  }

  try {
    const result = await sql`
      SELECT id, name, email, role, wallet_address, patient_certification, dc_residency, referral_code, created_at, updated_at, auth_method, embedded_wallet
      FROM users 
      WHERE id = ${id.trim()}
    `

    if (result.length === 0) return null

    const user = result[0]

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      wallet_address: user.wallet_address,
      patient_certification: user.patient_certification,
      dc_residency: user.dc_residency,
      referral_code: user.referral_code,
      created_at: user.created_at,
      updated_at: user.updated_at,
      auth_method: user.auth_method,
      embedded_wallet: user.embedded_wallet,
    }
  } catch (error) {
    console.error("[v0] Error in getUserById:", error)
    return null
  }
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "users")

  if (!email || typeof email !== "string" || email.trim() === "") {
    console.log("[v0] verifyPassword called with invalid email:", email)
    return null
  }

  if (!password || typeof password !== "string" || password.trim() === "") {
    console.log("[v0] verifyPassword called with invalid password")
    return null
  }

  try {
    console.log("[v0] Starting password verification for:", email.trim().toLowerCase())
    const normalizedEmail = email.trim().toLowerCase()

    const result = await sql`
      SELECT id, name, email, password, role, wallet_address, patient_certification, dc_residency, referral_code, created_at, updated_at, auth_method, embedded_wallet
      FROM users 
      WHERE email = ${normalizedEmail}
    `

    if (result.length === 0) {
      console.log("[v0] No user found with email:", normalizedEmail)
      return null
    }

    const user = result[0]

    console.log("[v0] User found, verifying password with auth-utils")
    const { verifyPasswordHash } = require("./auth-utils")
    const isPasswordValid = await verifyPasswordHash(password, user.password)

    if (isPasswordValid) {
      console.log("[v0] Password verification successful")
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet_address: user.wallet_address,
        patient_certification: user.patient_certification,
        dc_residency: user.dc_residency,
        referral_code: user.referral_code,
        created_at: user.created_at,
        updated_at: user.updated_at,
        auth_method: user.auth_method,
        embedded_wallet: user.embedded_wallet,
      }
    }

    console.log("[v0] Password verification failed")
    return null
  } catch (error) {
    console.error("[v0] Error in verifyPassword:", error)
    return null
  }
}

export async function getUserByEmailAndRole(
  email: string,
  role: "customer" | "merchant" | "admin",
): Promise<(User & { password_hash: string }) | null> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "users")

  if (!email || typeof email !== "string" || email.trim() === "") {
    console.log("[v0] getUserByEmailAndRole called with invalid email:", email)
    return null
  }

  if (!role || !["customer", "merchant", "admin"].includes(role)) {
    console.log("[v0] getUserByEmailAndRole called with invalid role:", role)
    return null
  }

  try {
    const normalizedEmail = email.trim().toLowerCase()
    console.log("[v0] Looking up user by email and role:", normalizedEmail, role)

    const result = await sql`
      SELECT id, name, email, password, role, wallet_address, patient_certification, dc_residency, referral_code, created_at, updated_at, auth_method, embedded_wallet
      FROM users 
      WHERE email = ${normalizedEmail} AND role = ${role}
    `

    if (result.length === 0) {
      console.log("[v0] No user found with email and role:", normalizedEmail, role)
      return null
    }

    const user = result[0]

    const foundUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      wallet_address: user.wallet_address,
      patient_certification: user.patient_certification,
      dc_residency: user.dc_residency,
      referral_code: user.referral_code,
      created_at: user.created_at,
      updated_at: user.updated_at,
      password_hash: user.password,
      auth_method: user.auth_method,
      embedded_wallet: user.embedded_wallet,
    }

    console.log("[v0] User found with role:", { ...foundUser, password_hash: "[REDACTED]" })
    return foundUser
  } catch (error) {
    console.error("[v0] Error in getUserByEmailAndRole:", error)
    return null
  }
}

export async function createProduct(productData: Omit<Product, "id" | "created_at" | "updated_at">) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "products")

  const result = await sql`
    INSERT INTO products (name, description, category, strain_type, thc_percentage, cbd_percentage, price_per_unit, unit_type, merchant_id, stock_quantity, lab_tested, status)
    VALUES (${productData.name}, ${productData.description}, ${productData.category}, ${productData.strain_type}, ${productData.thc_percentage}, ${productData.cbd_percentage}, ${productData.price_per_unit}, ${productData.unit_type}, ${productData.merchant_id}, ${productData.stock_quantity}, ${productData.lab_tested}, ${productData.status})
    RETURNING *
  `
  return result[0] as Product
}

export async function getProductsByMerchant(merchantId: string): Promise<Product[]> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "products")

  const result = await sql`
    SELECT * FROM products 
    WHERE merchant_id = ${merchantId} AND status != 'inactive'
    ORDER BY created_at DESC
  `
  return result as Product[]
}

export async function getProductById(id: string): Promise<Product | null> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "products")

  const result = await sql`
    SELECT * FROM products WHERE id = ${id}
  `
  return result.length > 0 ? (result[0] as Product) : null
}

export async function updateProductStock(productId: string, newStock: number) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "products")

  await sql`
    UPDATE products 
    SET stock_quantity = ${newStock}, updated_at = NOW()
    WHERE id = ${productId}
  `
}

export async function createOrder(orderData: Omit<Order, "id" | "created_at" | "updated_at">) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "orders")

  const result = await sql`
    INSERT INTO orders (customer_id, merchant_id, total_amount, tax_amount, status, payment_method, payment_status, delivery_method, delivery_address, notes)
    VALUES (${orderData.customer_id}, ${orderData.merchant_id}, ${orderData.total_amount}, ${orderData.tax_amount}, ${orderData.status}, ${orderData.payment_method}, ${orderData.payment_status}, ${orderData.delivery_method}, ${JSON.stringify(orderData.delivery_address)}, ${orderData.notes})
    RETURNING *
  `
  return result[0] as Order
}

export async function createOrderItem(orderItem: Omit<OrderItem, "id" | "created_at">) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "order_items")

  const result = await sql`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
    VALUES (${orderItem.order_id}, ${orderItem.product_id}, ${orderItem.quantity}, ${orderItem.unit_price}, ${orderItem.total_price})
    RETURNING *
  `
  return result[0] as OrderItem
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "orders")

  const result = await sql`
    SELECT * FROM orders 
    WHERE customer_id = ${customerId}
    ORDER BY created_at DESC
  `
  return result as Order[]
}

export async function getOrdersByMerchant(merchantId: string): Promise<Order[]> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "orders")

  const result = await sql`
    SELECT * FROM orders 
    WHERE merchant_id = ${merchantId}
    ORDER BY created_at DESC
  `
  return result as Order[]
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "orders")

  await sql`
    UPDATE orders 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${orderId}
  `
}

export async function createMerchantProfile(profileData: Omit<MerchantProfile, "id" | "created_at" | "updated_at">) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "merchant_profiles")

  const result = await sql`
    INSERT INTO merchant_profiles (user_id, business_name, license_number, license_type, business_address, phone, email, metrc_facility_id, approval_status)
    VALUES (${profileData.user_id}, ${profileData.business_name}, ${profileData.license_number}, ${profileData.license_type}, ${JSON.stringify(profileData.business_address)}, ${profileData.phone}, ${profileData.email}, ${profileData.metrc_facility_id}, ${profileData.approval_status})
    RETURNING *
  `
  return result[0] as MerchantProfile
}

export async function getMerchantProfile(userId: string): Promise<MerchantProfile | null> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "merchant_profiles")

  const result = await sql`
    SELECT * FROM merchant_profiles WHERE user_id = ${userId}
  `
  return result.length > 0 ? (result[0] as MerchantProfile) : null
}

export async function getPendingMerchantApprovals(): Promise<MerchantProfile[]> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "merchant_profiles")

  const result = await sql`
    SELECT * FROM merchant_profiles 
    WHERE approval_status = 'pending'
    ORDER BY created_at ASC
  `
  return result as MerchantProfile[]
}

export async function approveMerchant(profileId: string, approvedBy: string) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "merchant_profiles")

  await sql`
    UPDATE merchant_profiles 
    SET approval_status = 'approved', approved_by = ${approvedBy}, approved_at = NOW(), updated_at = NOW()
    WHERE id = ${profileId}
  `
}

export async function createApprovalWorkflow(workflowData: Omit<ApprovalWorkflow, "id" | "created_at" | "updated_at">) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "approval_workflows")

  const result = await sql`
    INSERT INTO approval_workflows (workflow_type, entity_id, entity_type, status, requested_by, assigned_to, notes)
    VALUES (${workflowData.workflow_type}, ${workflowData.entity_id}, ${workflowData.entity_type}, ${workflowData.status}, ${workflowData.requested_by}, ${workflowData.assigned_to}, ${workflowData.notes})
    RETURNING *
  `
  return result[0] as ApprovalWorkflow
}

export async function getPendingApprovals(assignedTo?: string): Promise<ApprovalWorkflow[]> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "approval_workflows")

  const query = assignedTo
    ? sql`SELECT * FROM approval_workflows WHERE status = 'pending' AND assigned_to = ${assignedTo} ORDER BY created_at ASC`
    : sql`SELECT * FROM approval_workflows WHERE status = 'pending' ORDER BY created_at ASC`

  const result = await query
  return result as ApprovalWorkflow[]
}

export async function updateApprovalStatus(
  workflowId: string,
  status: ApprovalWorkflow["status"],
  approvedBy: string,
  rejectionReason?: string,
) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "approval_workflows")

  await sql`
    UPDATE approval_workflows 
    SET status = ${status}, approved_by = ${approvedBy}, rejection_reason = ${rejectionReason}, updated_at = NOW()
    WHERE id = ${workflowId}
  `
}

export async function addPuffPoints(userId: string, points: number, transactionDescription: string, orderId?: string) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "puff_points")

  await sql`
    INSERT INTO puff_points (user_id, points_earned, points_balance, transaction_type, transaction_description, order_id)
    VALUES (${userId}, ${points}, ${points}, 'earned', ${transactionDescription}, ${orderId})
  `

  await sql`
    UPDATE puff_points 
    SET points_balance = (
      SELECT COALESCE(SUM(points_earned) - SUM(points_spent), 0) 
      FROM puff_points 
      WHERE user_id = ${userId}
    )
    WHERE user_id = ${userId}
  `
}

export async function getUserPuffPoints(userId: string): Promise<number> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "puff_points")

  const result = await sql`
    SELECT COALESCE(SUM(points_earned) - SUM(points_spent), 0) as balance
    FROM puff_points 
    WHERE user_id = ${userId}
  `
  return result[0]?.balance || 0
}

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "users")

  if (!walletAddress || typeof walletAddress !== "string" || walletAddress.trim() === "") {
    console.log("[v0] getUserByWallet called with invalid wallet address:", walletAddress)
    return null
  }

  try {
    const normalizedAddress = walletAddress.trim().toLowerCase()
    console.log("[v0] Looking up user by wallet address:", normalizedAddress)

    const result = await sql`
      SELECT id, name, email, role, wallet_address, patient_certification, dc_residency, referral_code, created_at, updated_at, auth_method, embedded_wallet
      FROM users 
      WHERE LOWER(wallet_address) = ${normalizedAddress}
    `

    if (result.length === 0) {
      console.log("[v0] No user found with wallet address:", normalizedAddress)
      return null
    }

    const user = result[0]

    const foundUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      wallet_address: user.wallet_address,
      patient_certification: user.patient_certification,
      dc_residency: user.dc_residency,
      referral_code: user.referral_code,
      created_at: user.created_at,
      updated_at: user.updated_at,
      auth_method: user.auth_method,
      embedded_wallet: user.embedded_wallet,
    }

    console.log("[v0] User found by wallet:", { ...foundUser, role: foundUser.role })
    return foundUser
  } catch (error) {
    console.error("[v0] Error in getUserByWallet:", error)
    return null
  }
}

export async function getProviderId(name: string) {
  const sql = getSql()

  const { ensureTable } = require("./db-migrations")
  ensureTable(sql, "providers")

  try {
    const result = await sql`
      SELECT id FROM providers WHERE name = ${name} LIMIT 1
    `

    if (result.length > 0) {
      return result[0].id
    }

    console.log(`[v0] Provider '${name}' not found, creating it...`)
    const insertResult = await sql`
      INSERT INTO providers (name, display_name)
      VALUES (${name}, ${name.charAt(0).toUpperCase() + name.slice(1)})
      ON CONFLICT (name) DO UPDATE SET display_name = ${name.charAt(0).toUpperCase() + name.slice(1)}
      RETURNING id
    `

    return insertResult[0]?.id ?? null
  } catch (error: any) {
    console.error("[v0] Error in getProviderId:", error)
    throw error
  }
}

// Note: Use getSql() function for lazy database initialization
// Do NOT export sql directly from @neondatabase/serverless as it causes
// the client to instantiate at module load time, triggering browser warnings
