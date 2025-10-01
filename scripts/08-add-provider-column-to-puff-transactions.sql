-- Migration: Add provider column to puff_transactions
-- Version: v1.0.3
-- Purpose: Enable pluggable payment provider tracking (Cybrid, Sphere)
-- Applied by: system
-- Date: 2025-01-XX

-- Added schema_migrations table and full audit tracking

-- 1. Create schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  migration_name TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT now(),
  applied_by TEXT NOT NULL,
  purpose TEXT NOT NULL,
  rollback_sql TEXT,
  notes TEXT
);

-- 2. Add the provider column to puff_transactions
ALTER TABLE puff_transactions
ADD COLUMN IF NOT EXISTS provider TEXT;

-- 3. Backfill existing rows with 'cybrid' to preserve historical integrity
UPDATE puff_transactions
SET provider = 'cybrid'
WHERE provider IS NULL;

-- 4. Add constraint to enforce valid provider values
ALTER TABLE puff_transactions
ADD CONSTRAINT provider_valid CHECK (provider IN ('cybrid', 'sphere'));

-- 5. Make provider NOT NULL now that all rows have a value
ALTER TABLE puff_transactions
ALTER COLUMN provider SET NOT NULL;

-- 6. Add index for provider lookups
CREATE INDEX IF NOT EXISTS idx_puff_transactions_provider ON puff_transactions(provider);

-- 7. Register this migration in schema_migrations
INSERT INTO schema_migrations (
  migration_name,
  version,
  applied_by,
  purpose,
  rollback_sql,
  notes
) VALUES (
  '08-add-provider-column-to-puff-transactions',
  'v1.0.3',
  'system',
  'Enable pluggable payment provider tracking (Cybrid, Sphere)',
  'ALTER TABLE puff_transactions DROP COLUMN provider;',
  'Backfilled existing transactions with cybrid as default provider'
) ON CONFLICT (migration_name) DO NOTHING;

-- 8. Log migration in audit_logs for compliance
INSERT INTO audit_logs (
  actor_type,
  action,
  resource_type,
  resource_id,
  new_values,
  metadata
) VALUES (
  'system',
  'schema_migration_applied',
  'puff_transactions',
  (SELECT id FROM schema_migrations WHERE migration_name = '08-add-provider-column-to-puff-transactions'),
  jsonb_build_object(
    'migration_name', '08-add-provider-column-to-puff-transactions',
    'version', 'v1.0.3',
    'column_added', 'provider',
    'constraint_added', 'provider_valid',
    'backfill_value', 'cybrid'
  ),
  jsonb_build_object(
    'purpose', 'Enable pluggable payment provider tracking',
    'providers_supported', jsonb_build_array('cybrid', 'sphere'),
    'breaking_change', false,
    'requires_code_deploy', true
  )
);
