-- Add provider column to puff_transactions table
-- This tracks which payment provider processed the transaction (e.g., 'cybrid', 'stripe')

ALTER TABLE puff_transactions 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50);

-- Add an index for faster queries by provider
CREATE INDEX IF NOT EXISTS idx_puff_transactions_provider 
ON puff_transactions(provider);

-- Optional: Update existing records to have a default provider value
-- UPDATE puff_transactions SET provider = 'legacy' WHERE provider IS NULL;
