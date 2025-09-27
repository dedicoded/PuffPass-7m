import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Web3HealthMetric {
  status: "connected" | "error" | "unavailable" | "initializing"
  latency?: number
  lastError?: string
  errorCount?: number
  projectId?: string
  isDemo?: boolean
  provider?: string
  chainId?: number
  networkName?: string
  connectionAttempts?: number
  successfulConnections?: number
  failedConnections?: number
  uptimePercentage?: number
  operator?: string
  checkType?: "automated" | "manual" | "scheduled"
  environment?: string
  userAgent?: string
  ipAddress?: string
  sessionId?: string
  metadata?: Record<string, any>
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

class DatabaseRetryManager {
  private static instance: DatabaseRetryManager
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
  }
  private failureCount = 0
  private lastFailureTime = 0
  private isHealthy = true
  private pendingMetrics: Web3HealthMetric[] = []
  private maxPendingMetrics = 100

  static getInstance(): DatabaseRetryManager {
    if (!DatabaseRetryManager.instance) {
      DatabaseRetryManager.instance = new DatabaseRetryManager()
    }
    return DatabaseRetryManager.instance
  }

  private calculateDelay(attempt: number): number {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelay,
    )
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async executeWithRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T | null> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const result = await operation()

        // Success - reset failure tracking
        if (this.failureCount > 0) {
          console.log(`[v0] Database connection restored for ${operationName}`)
          this.failureCount = 0
          this.isHealthy = true

          // Process any pending metrics
          await this.processPendingMetrics()
        }

        return result
      } catch (error) {
        lastError = error as Error
        this.failureCount++
        this.lastFailureTime = Date.now()

        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateDelay(attempt)
          console.warn(
            `[v0] ${operationName} failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}), retrying in ${Math.round(delay)}ms:`,
            error instanceof Error ? error.message : error,
          )
          await this.sleep(delay)
        }
      }
    }

    // All retries exhausted
    this.isHealthy = false
    console.error(
      `[v0] ${operationName} failed after ${this.retryConfig.maxRetries + 1} attempts:`,
      lastError instanceof Error ? lastError.message : String(lastError),
    )

    return null
  }

  queueMetricForRetry(metric: Web3HealthMetric): void {
    if (this.pendingMetrics.length >= this.maxPendingMetrics) {
      // Remove oldest metric to make room
      this.pendingMetrics.shift()
      console.warn("[v0] Pending metrics queue full, dropping oldest metric")
    }

    this.pendingMetrics.push({
      ...metric,
      metadata: {
        ...metric.metadata,
        queuedAt: new Date().toISOString(),
        retryAttempt: true,
      },
    })
  }

  private async processPendingMetrics(): Promise<void> {
    if (this.pendingMetrics.length === 0) return

    console.log(`[v0] Processing ${this.pendingMetrics.length} pending health metrics`)

    const metricsToProcess = [...this.pendingMetrics]
    this.pendingMetrics = []

    for (const metric of metricsToProcess) {
      try {
        await this.executeWithRetry(() => Web3HealthLogger.logHealthMetricDirect(metric), "pending metric logging")
      } catch (error) {
        console.error("[v0] Failed to process pending metric:", error)
        // Don't re-queue to avoid infinite loops
      }
    }
  }

  getHealthStatus(): {
    isHealthy: boolean
    failureCount: number
    lastFailureTime: number
    pendingMetricsCount: number
  } {
    return {
      isHealthy: this.isHealthy,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      pendingMetricsCount: this.pendingMetrics.length,
    }
  }
}

export class Web3HealthLogger {
  private static retryManager = DatabaseRetryManager.getInstance()

  /**
   * Log Web3 health metrics to compliance pipeline with retry/backoff
   */
  static async logHealthMetric(metric: Web3HealthMetric): Promise<void> {
    const result = await this.retryManager.executeWithRetry(
      () => this.logHealthMetricDirect(metric),
      "health metric logging",
    )

    if (result === null) {
      // Database unavailable - queue for retry and log to console
      this.retryManager.queueMetricForRetry(metric)
      console.log(`[v0] Health metric logged to console (DB unavailable): ${metric.status}`, {
        status: metric.status,
        latency: metric.latency,
        error: metric.lastError,
        provider: metric.provider,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Direct database logging without retry logic (used internally)
   */
  static async logHealthMetricDirect(metric: Web3HealthMetric): Promise<void> {
    const maskedProjectId = metric.projectId ? `${metric.projectId.slice(0, 8)}...${metric.projectId.slice(-4)}` : null

    await sql`
      INSERT INTO web3_health_metrics (
        status,
        latency_ms,
        last_error,
        error_count,
        project_id,
        is_demo,
        provider,
        chain_id,
        network_name,
        connection_attempts,
        successful_connections,
        failed_connections,
        uptime_percentage,
        operator,
        check_type,
        environment,
        user_agent,
        ip_address,
        session_id,
        metadata
      ) VALUES (
        ${metric.status},
        ${metric.latency || null},
        ${metric.lastError || null},
        ${metric.errorCount || 0},
        ${maskedProjectId},
        ${metric.isDemo || false},
        ${metric.provider || "walletconnect"},
        ${metric.chainId || null},
        ${metric.networkName || null},
        ${metric.connectionAttempts || 1},
        ${metric.successfulConnections || 0},
        ${metric.failedConnections || 0},
        ${metric.uptimePercentage || null},
        ${metric.operator || "system"},
        ${metric.checkType || "automated"},
        ${metric.environment || "production"},
        ${metric.userAgent || null},
        ${metric.ipAddress || null},
        ${metric.sessionId || null},
        ${metric.metadata ? JSON.stringify(metric.metadata) : null}
      )
    `

    console.log(`[v0] Web3 health metric logged to database: ${metric.status}`)
  }

  /**
   * Update integration status for dashboard with retry logic
   */
  static async updateIntegrationStatus(
    integrationName: string,
    status: "active" | "inactive" | "degraded" | "maintenance",
    healthScore: number,
    errorRate?: number,
    avgResponseTime?: number,
    operator?: string,
  ): Promise<void> {
    const result = await this.retryManager.executeWithRetry(
      () =>
        this.updateIntegrationStatusDirect(integrationName, status, healthScore, errorRate, avgResponseTime, operator),
      "integration status update",
    )

    if (result === null) {
      console.log(`[v0] Integration status logged to console (DB unavailable): ${integrationName} -> ${status}`, {
        healthScore,
        errorRate,
        avgResponseTime,
        timestamp: new Date().toISOString(),
      })
    }
  }

  private static async updateIntegrationStatusDirect(
    integrationName: string,
    status: "active" | "inactive" | "degraded" | "maintenance",
    healthScore: number,
    errorRate?: number,
    avgResponseTime?: number,
    operator?: string,
  ): Promise<void> {
    await sql`
      UPDATE web3_integration_status 
      SET 
        status = ${status},
        health_score = ${healthScore},
        error_rate = ${errorRate || null},
        avg_response_time = ${avgResponseTime || null},
        last_health_check = NOW(),
        last_updated_by = ${operator || "system"},
        last_status_change = CASE 
          WHEN status != ${status} THEN NOW() 
          ELSE last_status_change 
        END,
        current_uptime = CASE 
          WHEN ${status} = 'active' THEN LEAST(100.0, health_score)
          WHEN ${status} = 'degraded' THEN GREATEST(50.0, health_score * 0.8)
          ELSE 0.0
        END,
        compliance_status = CASE 
          WHEN ${healthScore} >= 99 THEN 'compliant'
          WHEN ${healthScore} >= 95 THEN 'at_risk'
          ELSE 'non_compliant'
        END
      WHERE integration_name = ${integrationName}
    `

    console.log(`[v0] Integration status updated in database: ${integrationName} -> ${status}`)
  }

  /**
   * Get recent health metrics for dashboard
   */
  static async getRecentHealthMetrics(hours = 24): Promise<any[]> {
    try {
      const metrics = await sql`
        SELECT 
          status,
          latency_ms,
          error_count,
          provider,
          is_demo,
          check_type,
          environment,
          timestamp
        FROM web3_health_metrics 
        WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
        ORDER BY timestamp DESC
        LIMIT 100
      `

      return metrics
    } catch (error) {
      console.error("[v0] Failed to get health metrics:", error)
      return []
    }
  }

  /**
   * Get compliance summary for dashboard
   */
  static async getComplianceSummary(): Promise<any[]> {
    try {
      const summary = await sql`
        SELECT * FROM web3_compliance_summary
      `

      return summary
    } catch (error) {
      console.error("[v0] Failed to get compliance summary:", error)
      return []
    }
  }

  /**
   * Generate health report for audit
   */
  static async generateHealthReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const [metrics, integrations, auditLogs] = await Promise.all([
        // Health metrics summary
        sql`
          SELECT 
            status,
            COUNT(*) as count,
            AVG(latency_ms) as avg_latency,
            MAX(error_count) as max_errors,
            environment
          FROM web3_health_metrics 
          WHERE timestamp BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
          GROUP BY status, environment
          ORDER BY count DESC
        `,

        // Integration status
        sql`
          SELECT 
            integration_name,
            status,
            health_score,
            current_uptime,
            compliance_status,
            error_rate
          FROM web3_integration_status
        `,

        // Related audit logs
        sql`
          SELECT 
            action,
            operator,
            timestamp,
            details
          FROM audit_logs 
          WHERE action LIKE '%web3%' 
            AND timestamp BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
          ORDER BY timestamp DESC
        `,
      ])

      return {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        healthMetrics: metrics,
        integrationStatus: integrations,
        auditTrail: auditLogs,
        generatedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error("[v0] Failed to generate health report:", error)
      return null
    }
  }

  /**
   * Get database health status for monitoring
   */
  static getDatabaseHealthStatus() {
    return this.retryManager.getHealthStatus()
  }

  /**
   * Force retry of pending metrics (for manual recovery)
   */
  static async retryPendingMetrics(): Promise<void> {
    const retryManager = DatabaseRetryManager.getInstance()
    await (retryManager as any).processPendingMetrics()
  }
}
