-- Create deployments table to track deployment information
CREATE TABLE IF NOT EXISTS deployments (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  environment VARCHAR(50) NOT NULL DEFAULT 'production',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  version VARCHAR(100),
  commit_hash VARCHAR(40),
  branch VARCHAR(100),
  platform VARCHAR(50) NOT NULL DEFAULT 'vercel',
  url TEXT,
  build_time INTEGER, -- in seconds
  deploy_time INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deployed_by VARCHAR(255),
  deployment_config JSONB DEFAULT '{}',
  
  -- Add indexes for common queries
  INDEX idx_deployments_project_env (project_name, environment),
  INDEX idx_deployments_status (status),
  INDEX idx_deployments_created_at (created_at DESC)
);

-- Create deployment_logs table for storing build and deployment logs
CREATE TABLE IF NOT EXISTS deployment_logs (
  id SERIAL PRIMARY KEY,
  deployment_id INTEGER REFERENCES deployments(id) ON DELETE CASCADE,
  log_type VARCHAR(50) NOT NULL, -- 'build', 'deploy', 'runtime'
  log_level VARCHAR(20) NOT NULL DEFAULT 'info', -- 'debug', 'info', 'warn', 'error'
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  INDEX idx_deployment_logs_deployment_id (deployment_id),
  INDEX idx_deployment_logs_timestamp (timestamp DESC),
  INDEX idx_deployment_logs_level (log_level)
);

-- Create environments table for environment configuration
CREATE TABLE IF NOT EXISTS environments (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_name, name),
  INDEX idx_environments_project (project_name),
  INDEX idx_environments_active (is_active)
);

-- Create deployment_metrics table for performance tracking
CREATE TABLE IF NOT EXISTS deployment_metrics (
  id SERIAL PRIMARY KEY,
  deployment_id INTEGER REFERENCES deployments(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  INDEX idx_deployment_metrics_deployment_id (deployment_id),
  INDEX idx_deployment_metrics_name (metric_name),
  INDEX idx_deployment_metrics_timestamp (timestamp DESC)
);

-- Create deployment_alerts table for monitoring alerts
CREATE TABLE IF NOT EXISTS deployment_alerts (
  id SERIAL PRIMARY KEY,
  deployment_id INTEGER REFERENCES deployments(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'performance', 'error', 'security', 'availability'
  severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  INDEX idx_deployment_alerts_deployment_id (deployment_id),
  INDEX idx_deployment_alerts_type (alert_type),
  INDEX idx_deployment_alerts_severity (severity),
  INDEX idx_deployment_alerts_resolved (is_resolved)
);
