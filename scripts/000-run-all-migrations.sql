-- Master migration script - runs all migrations in order
-- Run this script to set up the complete database schema

\echo 'Starting PuffPass database migrations...'
\echo ''

\echo '1/6 Enabling PostgreSQL extensions...'
\i scripts/001-enable-extensions.sql
\echo ''

\echo '2/6 Creating users table...'
\i scripts/002-create-users-table.sql
\echo ''

\echo '3/6 Creating crypto wallets table...'
\i scripts/003-create-crypto-wallets-table.sql
\echo ''

\echo '4/6 Creating merchant tables...'
\i scripts/004-create-merchant-tables.sql
\echo ''

\echo '5/6 Creating Puff Vault tables...'
\i scripts/005-create-puff-vault-tables.sql
\echo ''

\echo '6/6 Creating transactions table...'
\i scripts/006-create-transactions-table.sql
\echo ''

\echo 'All migrations completed successfully!'
\echo 'Database schema is ready for PuffPass.'
