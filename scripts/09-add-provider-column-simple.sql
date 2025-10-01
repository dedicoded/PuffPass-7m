-- Simple migration to add provider column to puff_transactions
-- This column tracks which payment provider processed the transaction

-- Add the provider column (nullable for backward compatibility)
ALTER TABLE puff_transactions 
ADD COLUMN IF NOT EXISTS provider TEXT;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_puff_transactions_provider 
ON puff_transactions(provider);

-- Optionally backfill existing records
UPDATE puff_transactions 
SET provider = 'cybrid' 
WHERE provider IS NULL;
