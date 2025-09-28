-- Create deployments table to track deployment information
CREATE TABLE IF NOT EXISTS deployments (
  id SERIAL PRIMARY KEY,
  deployment_id VARCHAR(255) UNIQUE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  branch VARCHAR(255) NOT NULL,
  environment VARCHAR(50) NOT NULL DEFAULT 'preview',
  status VARCHAR(50) NOT NULL DEFAULT 'building',
  commit_hash VARCHAR(255),
  commit_message TEXT,
  author VARCHAR(255),
  author_avatar VARCHAR(500),
  build_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deployed_at TIMESTAMP WITH TIME ZONE,
  url VARCHAR(500),
  preview_url VARCHAR(500)
);

-- Create deployment_logs table for storing build and runtime logs
CREATE TABLE IF NOT EXISTS deployment_logs (
  id SERIAL PRIMARY KEY,
  deployment_id VARCHAR(255) REFERENCES deployments(deployment_id) ON DELETE CASCADE,
  log_type VARCHAR(50) NOT NULL, -- 'build', 'runtime', 'error'
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level VARCHAR(20) DEFAULT 'info' -- 'info', 'warn', 'error', 'debug'
);

-- Create deployment_metrics table for performance and usage metrics
CREATE TABLE IF NOT EXISTS deployment_metrics (
  id SERIAL PRIMARY KEY,
  deployment_id VARCHAR(255) REFERENCES deployments(deployment_id) ON DELETE CASCADE,
  metric_type VARCHAR(100) NOT NULL, -- 'requests', 'response_time', 'data_transfer', 'errors'
  value DECIMAL(15,4) NOT NULL,
  unit VARCHAR(20), -- 'ms', 'bytes', 'count', 'percentage'
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table for project information
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  repository_url VARCHAR(500),
  framework VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deployments_project_name ON deployments(project_name);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_environment ON deployments(environment);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_timestamp ON deployment_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deployment_metrics_deployment_id ON deployment_metrics(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_metrics_recorded_at ON deployment_metrics(recorded_at DESC);

-- Insert sample data for demonstration
INSERT INTO projects (project_id, name, repository_url, framework) VALUES
('prj_puffpass_main', 'PuffPass', 'https://github.com/puffpass/main', 'Next.js'),
('prj_puffpass_admin', 'PuffPass Admin', 'https://github.com/puffpass/admin', 'Next.js'),
('prj_puffpass_api', 'PuffPass API', 'https://github.com/puffpass/api', 'Node.js')
ON CONFLICT (project_id) DO NOTHING;

-- Insert sample deployment data
INSERT INTO deployments (deployment_id, project_name, branch, environment, status, commit_hash, commit_message, author, author_avatar, build_duration, created_at, deployed_at, url, preview_url) VALUES
('8JfpicWAW', 'PuffPass', 'max/05-10-image-ui', 'preview', 'ready', '15852de', 'fix image UI improvements', 'MaxLeiter', 'https://github.com/maxleiter.png', 124, NOW() - INTERVAL '12 minutes', NOW() - INTERVAL '10 minutes', 'https://puffpass-8jfpicwaw.vercel.app', 'https://puffpass-8jfpicwaw.vercel.app'),
('BOotKPg4n', 'PuffPass', 'main', 'production', 'ready', 'b76b5a7', 'set metadata on project creation', 'aryamankha', 'https://github.com/aryamankha.png', 89, NOW() - INTERVAL '38 minutes', NOW() - INTERVAL '35 minutes', 'https://puffpass.vercel.app', 'https://puffpass.vercel.app'),
('ti3VpKTef', 'PuffPass', 'set-metadata', 'preview', 'ready', '67d0c9f', 'set metadata on project creation', 'aryamankha', 'https://github.com/aryamankha.png', 156, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '58 minutes', 'https://puffpass-ti3vpktef.vercel.app', 'https://puffpass-ti3vpktef.vercel.app'),
('3moKhGDve', 'PuffPass', 'main', 'production', 'ready', '3b8b99c', 'add library check in frame', 'aryamankha', 'https://github.com/aryamankha.png', 203, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes', 'https://puffpass.vercel.app', 'https://puffpass.vercel.app'),
('EdKwQTYgv', 'PuffPass', 'ido/05-15-blocks', 'preview', 'ready', 'e02830e', 'Merge branch main into ido/05-15-blocks', 'IdoPesok', 'https://github.com/idopesok.png', 178, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes', 'https://puffpass-edkwqtygv.vercel.app', 'https://puffpass-edkwqtygv.vercel.app'),
('5QD2vLFUg', 'PuffPass', 'ido/05-15-blocks', 'preview', 'ready', '1b5bd14', 'wip', 'IdoPesok', 'https://github.com/idopesok.png', 145, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes', 'https://puffpass-5qd2vlfug.vercel.app', 'https://puffpass-5qd2vlfug.vercel.app'),
('ASY6eu74z', 'PuffPass', 'main', 'production', 'ready', '7529bd4', 'Ensure Block Source On Block Switch', 'IdoPesok', 'https://github.com/idopesok.png', 167, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes', 'https://puffpass.vercel.app', 'https://puffpass.vercel.app'),
('8yPLLeuv9', 'PuffPass', 'max/05-15-topups-2.5', 'preview', 'ready', '67a23a9', 'types', 'MaxLeiter', 'https://github.com/maxleiter.png', 134, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes', 'https://puffpass-8yplleuv9.vercel.app', 'https://puffpass-8yplleuv9.vercel.app'),
('4b2qYTmuA', 'PuffPass', 'max/05-15-topups-2', 'preview', 'ready', '7710e61', 'types', 'MaxLeiter', 'https://github.com/maxleiter.png', 142, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes', 'https://puffpass-4b2qytmua.vercel.app', 'https://puffpass-4b2qytmua.vercel.app'),
('Dg5unTXCW', 'PuffPass', 'max/05-15-topups-2.5', 'preview', 'ready', '4ab60cb', 'changed api log action', 'MaxLeiter', 'https://github.com/maxleiter.png', 189, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes', 'https://puffpass-dg5untxcw.vercel.app', 'https://puffpass-dg5untxcw.vercel.app')
ON CONFLICT (deployment_id) DO NOTHING;

-- Insert sample metrics data
INSERT INTO deployment_metrics (deployment_id, metric_type, value, unit, recorded_at) VALUES
('8JfpicWAW', 'requests', 289000, 'count', NOW() - INTERVAL '1 hour'),
('8JfpicWAW', 'response_time', 352.7, 'ms', NOW() - INTERVAL '1 hour'),
('8JfpicWAW', 'data_transfer_out', 102, 'GB', NOW() - INTERVAL '1 hour'),
('8JfpicWAW', 'data_transfer_in', 3, 'GB', NOW() - INTERVAL '1 hour'),
('BOotKPg4n', 'requests', 456000, 'count', NOW() - INTERVAL '1 hour'),
('BOotKPg4n', 'response_time', 298.4, 'ms', NOW() - INTERVAL '1 hour'),
('BOotKPg4n', 'data_transfer_out', 496, 'GB', NOW() - INTERVAL '1 hour'),
('BOotKPg4n', 'data_transfer_in', 381, 'GB', NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

-- Insert sample log data
INSERT INTO deployment_logs (deployment_id, log_type, message, level, timestamp) VALUES
('8JfpicWAW', 'build', 'Installing dependencies...', 'info', NOW() - INTERVAL '15 minutes'),
('8JfpicWAW', 'build', 'Building application...', 'info', NOW() - INTERVAL '14 minutes'),
('8JfpicWAW', 'build', 'Build completed successfully', 'info', NOW() - INTERVAL '12 minutes'),
('8JfpicWAW', 'runtime', 'Application started on port 3000', 'info', NOW() - INTERVAL '10 minutes'),
('BOotKPg4n', 'build', 'Installing dependencies...', 'info', NOW() - INTERVAL '40 minutes'),
('BOotKPg4n', 'build', 'Building application...', 'info', NOW() - INTERVAL '39 minutes'),
('BOotKPg4n', 'build', 'Build completed successfully', 'info', NOW() - INTERVAL '37 minutes'),
('BOotKPg4n', 'runtime', 'Application started on port 3000', 'info', NOW() - INTERVAL '35 minutes')
ON CONFLICT DO NOTHING;
