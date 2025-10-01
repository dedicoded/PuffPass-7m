import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * Migration Bot - Automatically registers schema migrations
 *
 * This function ensures every schema change is:
 * - Logged with version and timestamp
 * - Attributed to an actor (founder, admin, system)
 * - Documented with purpose and rollback instructions
 * - Traceable for audits and contributor onboarding
 */
export async function registerMigration({
  migrationName,
  version,
  appliedBy,
  purpose,
  rollbackSql,
  notes,
}: {
  migrationName: string
  version: string
  appliedBy: string
  purpose: string
  rollbackSql?: string
  notes?: string
}) {
  try {
    // Ensure schema_migrations table exists
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        migration_name TEXT NOT NULL UNIQUE,
        version TEXT NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT now(),
        applied_by TEXT NOT NULL,
        purpose TEXT NOT NULL,
        rollback_sql TEXT,
        notes TEXT
      )
    `

    // Register the migration
    await sql`
      INSERT INTO schema_migrations (
        migration_name,
        version,
        applied_by,
        purpose,
        rollback_sql,
        notes
      ) VALUES (
        ${migrationName},
        ${version},
        ${appliedBy},
        ${purpose},
        ${rollbackSql || null},
        ${notes || null}
      )
      ON CONFLICT (migration_name) DO NOTHING
    `

    // Add audit log entry
    await sql`
      INSERT INTO audit_logs (
        actor_id,
        actor_type,
        action,
        status,
        metadata
      ) VALUES (
        NULL,
        'system',
        'SCHEMA_MIGRATION',
        'success',
        ${JSON.stringify({
          migration: migrationName,
          version,
          appliedBy,
          purpose,
          timestamp: new Date().toISOString(),
        })}::jsonb
      )
    `

    console.log(`✅ Migration registered: ${migrationName} (${version})`)
    return { success: true }
  } catch (error) {
    console.error(`❌ Failed to register migration: ${migrationName}`, error)

    // Log the failure
    await sql`
      INSERT INTO audit_logs (
        actor_id,
        actor_type,
        action,
        status,
        metadata
      ) VALUES (
        NULL,
        'system',
        'SCHEMA_MIGRATION',
        'failed',
        ${JSON.stringify({
          migration: migrationName,
          version,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        })}::jsonb
      )
    `

    throw error
  }
}

/**
 * Example usage:
 *
 * await registerMigration({
 *   migrationName: "add_provider_column_to_puff_transactions",
 *   version: "v1.0.3",
 *   appliedBy: "founder",
 *   purpose: "Enable pluggable payment provider tracking",
 *   rollbackSql: "ALTER TABLE puff_transactions DROP COLUMN provider;",
 *   notes: "Backfilled existing rows with 'cybrid' to preserve historical integrity",
 * });
 */
