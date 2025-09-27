-- Execute the crypto integration setup
-- This script runs all the necessary database migrations for the crypto integration

-- Run the crypto integration tables script
\i scripts/05-add-crypto-integration-tables.sql;

-- Add some sample data for testing
INSERT INTO user_crypto_wallets (user_id, wallet_address, currency, network, is_primary) 
VALUES 
  (1, '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e', 'ETH', 'ethereum', true),
  (1, '0x8ba1f109551bD432803012645Hac136c', 'USDC', 'polygon', false)
ON CONFLICT (wallet_address) DO NOTHING;

-- Add sample crypto transactions
INSERT INTO crypto_transactions (user_id, amount, from_currency, to_currency, status, destination_address)
VALUES 
  (1, 100.00, 'USD', 'USDC', 'completed', '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e'),
  (1, 50.00, 'USD', 'ETH', 'pending', '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e')
ON CONFLICT DO NOTHING;
