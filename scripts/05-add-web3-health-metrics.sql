-- Create Web3 health metrics table for compliance pipeline integration
CREATE TABLE IF NOT EXISTS web3_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Health Data
    status VARCHAR(50) NOT NULL, -- connected, error, unavailable, initializing
    latency_ms INTEGER, -- Response time in milliseconds
    last_error TEXT, -- Last error message if any
    error_count INTEGER DEFAULT 0, -- Consecutive error count
    
    -- Connection Details
    project_id VARCHAR(255), -- WalletConnect project ID (masked for security)
    is_demo BOOLEAN DEFAULT FALSE, -- Whether using demo/fallback config
    provider VARCHAR(50) DEFAULT 'walletconnect', -- walletconnect, metamask, etc.
    
    -- Network Information
    chain_id INTEGER, -- Blockchain network ID
    network_name VARCHAR(100), -- ethereum, polygon, etc.
    rpc_endpoint VARCHAR(255), -- RPC endpoint (masked)
    
    -- Performance Metrics
    connection_attempts INTEGER DEFAULT 1,
    successful_connections INTEGER DEFAULT 0,
    failed_connections INTEGER DEFAULT 0,
    uptime_percentage DECIMAL(5,2), -- 99.95% format
    
    -- Compliance & Audit Fields
    operator VARCHAR(100), -- Who/what triggered the health check
    check_type VARCHAR(50) DEFAULT 'automated', -- automated, manual, scheduled
    environment VARCHAR(20) DEFAULT 'production', -- production, staging, development
    
    -- Metadata
    user_agent TEXT, -- Browser/client information
    ip_address INET, -- Source IP for audit trail
    session_id VARCHAR(255), -- Session identifier
    metadata JSONB, -- Additional structured data
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Web3 integration status table for dashboard
CREATE TABLE IF NOT EXISTS web3_integration_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_name VARCHAR(100) NOT NULL, -- cybrid, sphere, walletconnect, biconomy
    status VARCHAR(50) NOT NULL, -- active, inactive, degraded, maintenance
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_score INTEGER, -- 0-100, higher is better
    error_rate DECIMAL(5,2), -- Percentage of failed requests
    avg_response_time INTEGER, -- Average response time in ms
    
    -- Configuration
    api_endpoint VARCHAR(255),
    version VARCHAR(50),
    environment VARCHAR(20) DEFAULT 'production',
    
    -- Compliance
    sla_target DECIMAL(5,2) DEFAULT 99.9, -- SLA uptime target
    current_uptime DECIMAL(5,2), -- Current uptime percentage
    compliance_status VARCHAR(50) DEFAULT 'compliant', -- compliant, at_risk, non_compliant
    
    -- Audit Trail
    last_updated_by VARCHAR(100),
    last_status_change TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance and compliance queries
CREATE INDEX IF NOT EXISTS idx_web3_health_metrics_timestamp ON web3_health_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_web3_health_metrics_status ON web3_health_metrics(status);
CREATE INDEX IF NOT EXISTS idx_web3_health_metrics_operator ON web3_health_metrics(operator);
CREATE INDEX IF NOT EXISTS idx_web3_health_metrics_environment ON web3_health_metrics(environment);
CREATE INDEX IF NOT EXISTS idx_web3_integration_status_name ON web3_integration_status(integration_name);
CREATE INDEX IF NOT EXISTS idx_web3_integration_status_status ON web3_integration_status(status);

-- Create trigger for integration status updated_at
CREATE TRIGGER update_web3_integration_status_updated_at 
    BEFORE UPDATE ON web3_integration_status 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial Web3 integration records
INSERT INTO web3_integration_status (integration_name, status, health_score, sla_target, compliance_status) VALUES
('cybrid', 'active', 98, 99.9, 'compliant'),
('sphere', 'active', 97, 99.9, 'compliant'),
('walletconnect', 'active', 95, 99.5, 'compliant'),
('biconomy', 'active', 96, 99.5, 'compliant')
ON CONFLICT (integration_name) DO NOTHING;

-- Create function to automatically log Web3 health to audit_logs
CREATE OR REPLACE FUNCTION log_web3_health_to_audit()
RETURNS TRIGGER AS $$
BEGIN
    -- Log critical status changes to main audit_logs table
    IF NEW.status IN ('error', 'unavailable') OR 
       (OLD.status IS NOT NULL AND OLD.status != NEW.status) THEN
        
        INSERT INTO audit_logs (
            action,
            operator,
            timestamp,
            details
        ) VALUES (
            'web3_health_check',
            COALESCE(NEW.operator, 'system'),
            NEW.timestamp,
            jsonb_build_object(
                'status', NEW.status,
                'previous_status', OLD.status,
                'provider', NEW.provider,
                'latency_ms', NEW.latency_ms,
                'error_count', NEW.error_count,
                'last_error', NEW.last_error,
                'is_demo', NEW.is_demo,
                'check_type', NEW.check_type,
                'environment', NEW.environment
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic audit logging
CREATE TRIGGER web3_health_audit_trigger 
    AFTER INSERT OR UPDATE ON web3_health_metrics 
    FOR EACH ROW 
    EXECUTE FUNCTION log_web3_health_to_audit();

-- Create view for compliance dashboard
CREATE OR REPLACE VIEW web3_compliance_summary AS
SELECT 
    integration_name,
    status,
    health_score,
    current_uptime,
    sla_target,
    CASE 
        WHEN current_uptime >= sla_target THEN 'compliant'
        WHEN current_uptime >= (sla_target - 1.0) THEN 'at_risk'
        ELSE 'non_compliant'
    END as computed_compliance_status,
    error_rate,
    avg_response_time,
    last_health_check,
    EXTRACT(EPOCH FROM (NOW() - last_health_check))/60 as minutes_since_check
FROM web3_integration_status
ORDER BY 
    CASE status 
        WHEN 'active' THEN 1 
        WHEN 'degraded' THEN 2 
        WHEN 'maintenance' THEN 3 
        ELSE 4 
    END,
    health_score DESC;

-- Create function for health metrics cleanup (retain 30 days)
CREATE OR REPLACE FUNCTION cleanup_web3_health_metrics()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM web3_health_metrics 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup to audit trail
    INSERT INTO audit_logs (
        action,
        operator,
        timestamp,
        details
    ) VALUES (
        'web3_metrics_cleanup',
        'system',
        NOW(),
        jsonb_build_object(
            'deleted_records', deleted_count,
            'retention_days', 30
        )
    );
    
    RETURN deleted_count;
END;
$$ language 'plpgsql';
