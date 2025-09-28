-- Deployment Details Dashboard Schema
-- This script creates tables for tracking deployment information

-- Projects table for organizing deployments
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    repository_url TEXT,
    owner_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployments table for tracking deployment details
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    deployment_url TEXT,
    branch_name VARCHAR(255) NOT NULL DEFAULT 'main',
    commit_hash VARCHAR(255),
    commit_message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'building' CHECK (status IN ('building', 'ready', 'error', 'cancelled')),
    environment VARCHAR(50) NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'preview', 'development')),
    build_time_seconds INTEGER,
    deployed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Deployment logs for tracking build and runtime logs
CREATE TABLE IF NOT EXISTS deployment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
    log_level VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployment metrics for performance tracking
CREATE TABLE IF NOT EXISTS deployment_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample projects
INSERT INTO projects (name, description, repository_url, owner_id) VALUES
('PuffPass Frontend', 'Main customer-facing application', 'https://github.com/puffpass/frontend', 'user_123'),
('PuffPass API', 'Backend API service', 'https://github.com/puffpass/api', 'user_123'),
('Admin Dashboard', 'Merchant and admin management portal', 'https://github.com/puffpass/admin', 'user_456')
ON CONFLICT DO NOTHING;

-- Insert sample deployments
INSERT INTO deployments (project_id, deployment_url, branch_name, commit_hash, commit_message, status, environment, build_time_seconds, deployed_by) VALUES
((SELECT id FROM projects WHERE name = 'PuffPass Frontend' LIMIT 1), 'https://puffpass-frontend.vercel.app', 'main', 'abc123def456', 'feat: add new payment flow', 'ready', 'production', 45, 'user_123'),
((SELECT id FROM projects WHERE name = 'PuffPass Frontend' LIMIT 1), 'https://puffpass-frontend-git-feature-branch.vercel.app', 'feature/rewards-system', 'def456ghi789', 'wip: rewards dashboard improvements', 'building', 'preview', NULL, 'user_123'),
((SELECT id FROM projects WHERE name = 'PuffPass API' LIMIT 1), 'https://api.puffpass.com', 'main', 'ghi789jkl012', 'fix: authentication middleware', 'ready', 'production', 120, 'user_456'),
((SELECT id FROM projects WHERE name = 'Admin Dashboard' LIMIT 1), 'https://admin.puffpass.com', 'main', 'jkl012mno345', 'feat: merchant analytics', 'ready', 'production', 67, 'user_456')
ON CONFLICT DO NOTHING;

-- Insert sample deployment logs
INSERT INTO deployment_logs (deployment_id, log_level, message) VALUES
((SELECT id FROM deployments WHERE commit_hash = 'abc123def456' LIMIT 1), 'info', 'Starting build process...'),
((SELECT id FROM deployments WHERE commit_hash = 'abc123def456' LIMIT 1), 'info', 'Installing dependencies...'),
((SELECT id FROM deployments WHERE commit_hash = 'abc123def456' LIMIT 1), 'info', 'Build completed successfully'),
((SELECT id FROM deployments WHERE commit_hash = 'def456ghi789' LIMIT 1), 'info', 'Build in progress...'),
((SELECT id FROM deployments WHERE commit_hash = 'ghi789jkl012' LIMIT 1), 'warn', 'Deprecated API usage detected'),
((SELECT id FROM deployments WHERE commit_hash = 'ghi789jkl012' LIMIT 1), 'info', 'Deployment successful')
ON CONFLICT DO NOTHING;

-- Insert sample metrics
INSERT INTO deployment_metrics (deployment_id, metric_name, metric_value, unit) VALUES
((SELECT id FROM deployments WHERE commit_hash = 'abc123def456' LIMIT 1), 'response_time', 245.50, 'ms'),
((SELECT id FROM deployments WHERE commit_hash = 'abc123def456' LIMIT 1), 'bundle_size', 2.4, 'MB'),
((SELECT id FROM deployments WHERE commit_hash = 'ghi789jkl012' LIMIT 1), 'response_time', 180.25, 'ms'),
((SELECT id FROM deployments WHERE commit_hash = 'ghi789jkl012' LIMIT 1), 'memory_usage', 512.0, 'MB')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_environment ON deployments(environment);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_level ON deployment_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_deployment_metrics_deployment_id ON deployment_metrics(deployment_id);

-- Update function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update trigger for projects
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
