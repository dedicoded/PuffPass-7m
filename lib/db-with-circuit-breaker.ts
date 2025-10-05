import { neon } from "@neondatabase/serverless"
import { CircuitBreaker, type CircuitBreakerConfig } from "./circuit-breaker"

let _sql: ReturnType<typeof neon> | null = null

function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set")
    }
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

// Circuit breaker configuration for database operations
const dbCircuitBreakerConfig: CircuitBreakerConfig = {
  failureThreshold: 5, // Trip after 5 consecutive failures
  recoveryTimeout: 60000, // Wait 60 seconds before testing recovery
  monitoringPeriod: 300000, // 5 minute monitoring window
  expectedErrors: ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"],
}

// Create circuit breakers for different operation types
const readCircuitBreaker = new CircuitBreaker("database-read", dbCircuitBreakerConfig)
const writeCircuitBreaker = new CircuitBreaker("database-write", {
  ...dbCircuitBreakerConfig,
  failureThreshold: 3, // More sensitive for writes
  recoveryTimeout: 30000, // Faster recovery for writes
})

// Circuit breaker protected SQL execution
export async function executeQuery<T = any>(
  query: Parameters<ReturnType<typeof neon>>[0],
  ...params: Parameters<ReturnType<typeof neon>> extends [any, ...infer Rest] ? Rest : never[]
): Promise<T[]> {
  return await readCircuitBreaker.execute(
    async () => {
      console.log(`[v0] Executing database query with circuit breaker protection`)
      const sql = getSql()
      return (await sql(query, ...params)) as T[]
    },
    async () => {
      // Fallback: return empty result and log to alternative storage
      console.log(`[v0] Database circuit breaker fallback - query failed, logging to alternative storage`)
      await logToFallbackStorage("query_failure", { query: String(query), timestamp: Date.now() })
      return [] as T[]
    },
  )
}

export async function executeWrite<T = any>(
  query: Parameters<ReturnType<typeof neon>>[0],
  ...params: Parameters<ReturnType<typeof neon>> extends [any, ...infer Rest] ? Rest : never[]
): Promise<T[]> {
  return await writeCircuitBreaker.execute(
    async () => {
      console.log(`[v0] Executing database write with circuit breaker protection`)
      const sql = getSql()
      return (await sql(query, ...params)) as T[]
    },
    async () => {
      // Fallback: queue write operation for later retry
      console.log(`[v0] Database write circuit breaker fallback - queuing operation`)
      await queueFailedWrite({ query: String(query), params, timestamp: Date.now() })
      throw new Error("Database write temporarily unavailable - operation queued for retry")
    },
  )
}

// Fallback storage mechanisms
async function logToFallbackStorage(event: string, data: any): Promise<void> {
  try {
    // In production, this could write to Redis, file system, or external logging service
    console.log(`[v0] Fallback storage - ${event}:`, data)

    // For now, store in memory (in production, use Redis or persistent storage)
    if (typeof globalThis !== "undefined") {
      if (!globalThis.fallbackLogs) globalThis.fallbackLogs = []
      globalThis.fallbackLogs.push({ event, data, timestamp: Date.now() })
    }
  } catch (error) {
    console.error(`[v0] Failed to write to fallback storage:`, error)
  }
}

async function queueFailedWrite(writeOperation: any): Promise<void> {
  try {
    console.log(`[v0] Queuing failed write operation:`, writeOperation)

    // In production, this could use Redis queue, database queue table, or message queue
    if (typeof globalThis !== "undefined") {
      if (!globalThis.failedWrites) globalThis.failedWrites = []
      globalThis.failedWrites.push(writeOperation)
    }
  } catch (error) {
    console.error(`[v0] Failed to queue write operation:`, error)
  }
}

// Health check endpoint for monitoring circuit breaker status
export function getCircuitBreakerStatus() {
  return {
    read: readCircuitBreaker.getMetrics(),
    write: writeCircuitBreaker.getMetrics(),
    timestamp: Date.now(),
  }
}

// Export circuit breakers for manual control if needed
export { readCircuitBreaker, writeCircuitBreaker }
