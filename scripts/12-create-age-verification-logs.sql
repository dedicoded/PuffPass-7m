-- Create age verification audit log table for compliance
CREATE TABLE IF NOT EXISTS age_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id TEXT,                        -- optional: link to users table
  ip_address INET,                     -- capture client IP for traceability
  user_agent TEXT,                     -- browser/device fingerprint
  route TEXT NOT NULL,                 -- which route was accessed
  action TEXT NOT NULL,                -- 'challenge', 'pass', 'fail', 'skip'
  reason TEXT,                         -- why it was skipped/failed (e.g. allowlist, expired token)
  verified BOOLEAN,                    -- true if passed, false if failed
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- compliance hooks
  audit_event JSONB DEFAULT '{}'       -- structured metadata for regulators
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_age_verification_logs_created_at ON age_verification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_age_verification_logs_action ON age_verification_logs(action);
CREATE INDEX IF NOT EXISTS idx_age_verification_logs_ip ON age_verification_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_age_verification_logs_user_id ON age_verification_logs(user_id) WHERE user_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON TABLE age_verification_logs IS 'Audit log for age verification enforcement - tracks all access decisions for regulatory compliance';
