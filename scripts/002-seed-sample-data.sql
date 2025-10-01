-- Insert sample projects and environments
INSERT INTO environments (project_name, name, description, variables) VALUES
('puffpass-frontend', 'production', 'Production environment for PuffPass frontend', '{"NODE_ENV": "production", "API_URL": "https://api.puffpass.com"}'),
('puffpass-frontend', 'staging', 'Staging environment for testing', '{"NODE_ENV": "staging", "API_URL": "https://staging-api.puffpass.com"}'),
('puffpass-api', 'production', 'Production API environment', '{"NODE_ENV": "production", "DATABASE_URL": "***", "JWT_SECRET": "***"}'),
('puffpass-api', 'staging', 'Staging API environment', '{"NODE_ENV": "staging", "DATABASE_URL": "***", "JWT_SECRET": "***"}');

-- Insert sample deployments
INSERT INTO deployments (project_name, environment, status, version, commit_hash, branch, platform, url, build_time, deploy_time, deployed_by, deployment_config) VALUES
('puffpass-frontend', 'production', 'success', 'v1.2.3', 'abc123def456', 'main', 'vercel', 'https://puffpass.vercel.app', 120, 45, 'john.doe@puffpass.com', '{"framework": "nextjs", "node_version": "18.x"}'),
('puffpass-frontend', 'staging', 'success', 'v1.2.4-beta', 'def456ghi789', 'develop', 'vercel', 'https://staging-puffpass.vercel.app', 95, 38, 'jane.smith@puffpass.com', '{"framework": "nextjs", "node_version": "18.x"}'),
('puffpass-api', 'production', 'success', 'v2.1.0', 'ghi789jkl012', 'main', 'railway', 'https://api.puffpass.com', 180, 60, 'john.doe@puffpass.com', '{"runtime": "nodejs", "database": "postgresql"}'),
('puffpass-api', 'staging', 'failed', 'v2.1.1-beta', 'jkl012mno345', 'develop', 'railway', null, 210, null, 'jane.smith@puffpass.com', '{"runtime": "nodejs", "database": "postgresql"}');

-- Insert sample deployment logs
INSERT INTO deployment_logs (deployment_id, log_type, log_level, message, metadata) VALUES
(1, 'build', 'info', 'Starting build process for Next.js application', '{"step": "build_start"}'),
(1, 'build', 'info', 'Installing dependencies...', '{"step": "install_deps"}'),
(1, 'build', 'info', 'Building application...', '{"step": "build_app"}'),
(1, 'build', 'info', 'Build completed successfully', '{"step": "build_complete", "duration": "120s"}'),
(1, 'deploy', 'info', 'Deploying to Vercel...', '{"step": "deploy_start"}'),
(1, 'deploy', 'info', 'Deployment successful', '{"step": "deploy_complete", "duration": "45s"}'),
(4, 'build', 'error', 'Build failed: TypeScript compilation errors', '{"step": "build_error", "error_count": 3}'),
(4, 'build', 'error', 'Property "userId" does not exist on type "User"', '{"file": "src/auth/types.ts", "line": 15}');

-- Insert sample deployment metrics
INSERT INTO deployment_metrics (deployment_id, metric_name, metric_value, unit, metadata) VALUES
(1, 'response_time', 245.50, 'ms', '{"endpoint": "/api/health"}'),
(1, 'memory_usage', 128.75, 'MB', '{"peak": true}'),
(1, 'cpu_usage', 15.30, '%', '{"average": true}'),
(1, 'bundle_size', 2.45, 'MB', '{"compressed": true}'),
(2, 'response_time', 198.20, 'ms', '{"endpoint": "/api/health"}'),
(2, 'memory_usage', 95.40, 'MB', '{"peak": true}'),
(3, 'response_time', 89.75, 'ms', '{"endpoint": "/api/health"}'),
(3, 'memory_usage', 256.80, 'MB', '{"peak": true}');

-- Insert sample deployment alerts
INSERT INTO deployment_alerts (deployment_id, alert_type, severity, title, description, is_resolved, metadata) VALUES
(1, 'performance', 'medium', 'High Response Time Detected', 'API response time exceeded 200ms threshold', true, '{"threshold": "200ms", "actual": "245ms"}'),
(3, 'error', 'high', 'Database Connection Issues', 'Multiple database connection timeouts detected', false, '{"error_count": 5, "timeframe": "5min"}'),
(4, 'error', 'critical', 'Deployment Failed', 'Build process failed due to compilation errors', false, '{"error_type": "typescript", "error_count": 3}');
