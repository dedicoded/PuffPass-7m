-- Add organization column for multi-org compliance reporting
ALTER TABLE age_verification_logs
ADD COLUMN IF NOT EXISTS organization TEXT;

-- Create index for organization queries
CREATE INDEX IF NOT EXISTS idx_age_verification_logs_org ON age_verification_logs(organization);

-- Add comment for documentation
COMMENT ON COLUMN age_verification_logs.organization IS 'Organization/dispensary identifier for multi-tenant compliance reporting';
