-- Migration: Make password column nullable for wallet-only authentication
-- This allows users to authenticate via wallet signature without requiring a password

-- Make password column nullable
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Add auth_method column to track authentication type
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'password';

-- Update existing wallet users to have NULL password and 'wallet' auth method
UPDATE users 
SET password = NULL, auth_method = 'wallet'
WHERE password = '' AND wallet_address IS NOT NULL;

-- Create index for auth_method for better query performance
CREATE INDEX IF NOT EXISTS idx_users_auth_method ON users(auth_method);

-- Add comment for documentation
COMMENT ON COLUMN users.password IS 'Password hash for password-based auth. NULL for wallet-only users.';
COMMENT ON COLUMN users.auth_method IS 'Authentication method: password, wallet, oauth, etc.';
