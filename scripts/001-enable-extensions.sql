-- Enable required PostgreSQL extensions
-- Run this first before any other migrations

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Case-insensitive text comparison
CREATE EXTENSION IF NOT EXISTS "citext";

-- Timestamp functions
CREATE EXTENSION IF NOT EXISTS "btree_gist";

SELECT 'Extensions enabled successfully' AS status;
