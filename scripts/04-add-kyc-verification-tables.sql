-- Create KYC verification tables for compliance
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id),
    verification_level VARCHAR(50) DEFAULT 'basic', -- basic, enhanced, premium
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_review, approved, rejected, expired
    
    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Address Information
    street_address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    
    -- Document Information
    document_type VARCHAR(50), -- drivers_license, passport, state_id
    document_number VARCHAR(100),
    document_expiry DATE,
    document_issuing_state VARCHAR(50),
    document_front_url TEXT,
    document_back_url TEXT,
    selfie_url TEXT,
    
    -- Verification Results
    identity_verified BOOLEAN DEFAULT FALSE,
    address_verified BOOLEAN DEFAULT FALSE,
    age_verified BOOLEAN DEFAULT FALSE,
    document_verified BOOLEAN DEFAULT FALSE,
    biometric_verified BOOLEAN DEFAULT FALSE,
    
    -- Risk Assessment
    risk_score INTEGER, -- 0-100, lower is better
    risk_level VARCHAR(20), -- low, medium, high
    sanctions_check BOOLEAN DEFAULT FALSE,
    pep_check BOOLEAN DEFAULT FALSE, -- Politically Exposed Person
    
    -- Processing Information
    verification_provider VARCHAR(50), -- jumio, onfido, etc.
    provider_reference_id VARCHAR(255),
    verification_notes TEXT,
    reviewed_by TEXT REFERENCES neon_auth.users_sync(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create KYC documents table for file tracking
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_verification_id UUID NOT NULL REFERENCES kyc_verifications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- id_front, id_back, selfie, proof_of_address
    file_name VARCHAR(255),
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, processing, verified, rejected
    verification_result JSONB, -- Store provider verification results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create KYC audit log for compliance tracking
CREATE TABLE IF NOT EXISTS kyc_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_verification_id UUID NOT NULL REFERENCES kyc_verifications(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- submitted, reviewed, approved, rejected, expired
    performed_by TEXT REFERENCES neon_auth.users_sync(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    reason TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add KYC status to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50) DEFAULT 'unverified';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS kyc_level VARCHAR(50) DEFAULT 'none';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_verification_level ON kyc_verifications(verification_level);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_verification_id ON kyc_documents(kyc_verification_id);
CREATE INDEX IF NOT EXISTS idx_kyc_audit_log_verification_id ON kyc_audit_log(kyc_verification_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status ON user_profiles(kyc_status);

-- Create trigger for KYC verifications updated_at
CREATE TRIGGER update_kyc_verifications_updated_at 
    BEFORE UPDATE ON kyc_verifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create audit log entries
CREATE OR REPLACE FUNCTION create_kyc_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create audit entry if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO kyc_audit_log (
            kyc_verification_id,
            action,
            previous_status,
            new_status,
            performed_by,
            created_at
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.status = 'approved' THEN 'approved'
                WHEN NEW.status = 'rejected' THEN 'rejected'
                WHEN NEW.status = 'in_review' THEN 'reviewed'
                ELSE 'status_changed'
            END,
            OLD.status,
            NEW.status,
            NEW.reviewed_by,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic audit logging
CREATE TRIGGER kyc_status_change_audit 
    AFTER UPDATE ON kyc_verifications 
    FOR EACH ROW 
    EXECUTE FUNCTION create_kyc_audit_entry();
