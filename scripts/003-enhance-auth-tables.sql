-- Enhanced authentication tables for PUFF PASS
-- Adds session tracking, passkeys, and KYC management

-- User sessions table for enhanced session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_id TEXT,
    device_info JSONB, -- Browser, OS, etc.
    ip_address INET,
    kyc_level VARCHAR(20) DEFAULT 'basic', -- basic, enhanced, full
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- Passkeys table for WebAuthn authentication
CREATE TABLE IF NOT EXISTS user_passkeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    device_type VARCHAR(50), -- 'platform' or 'cross-platform'
    device_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE
);

-- KYC verification table
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kyc_level VARCHAR(20) NOT NULL, -- basic, enhanced, full
    verification_method VARCHAR(50), -- document, biometric, manual
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, expired
    documents JSONB, -- Array of document references
    verified_by TEXT REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin trustee audit log
CREATE TABLE IF NOT EXISTS admin_trustee_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id TEXT,
    wallet_address TEXT,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery codes table for account recovery
CREATE TABLE IF NOT EXISTS recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Device trust table for progressive authentication
CREATE TABLE IF NOT EXISTS trusted_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_fingerprint TEXT NOT NULL,
    device_name VARCHAR(100),
    trust_level VARCHAR(20) DEFAULT 'basic', -- basic, trusted, verified
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trust_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_user_id ON user_passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_credential_id ON user_passkeys(credential_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_trustee_audit_user_id ON admin_trustee_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_trustee_audit_created_at ON admin_trustee_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_user_id ON recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_expires_at ON recovery_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_device_id ON trusted_devices(device_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add admin trustee wallet constraint (will be set via environment variable)
-- This ensures only the deployment wallet can access admin functions
COMMENT ON TABLE admin_trustee_audit IS 'Audit log for admin trustee actions - only deployment wallet holder can access admin functions';
