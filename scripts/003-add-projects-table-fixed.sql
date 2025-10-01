-- Create projects table to support the existing API structure
-- Fixed version with proper PostgreSQL syntax
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  repository_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes separately (PostgreSQL syntax)
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);

-- Insert sample projects
INSERT INTO projects (name, repository_url, description) VALUES
('puffpass-frontend', 'https://github.com/puffpass/frontend', 'PuffPass frontend application'),
('puffpass-api', 'https://github.com/puffpass/api', 'PuffPass backend API'),
('puffpass-admin', 'https://github.com/puffpass/admin', 'PuffPass admin dashboard')
ON CONFLICT (name) DO NOTHING;

-- Add project_id column to deployments if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deployments' AND column_name = 'project_id') THEN
        ALTER TABLE deployments ADD COLUMN project_id INTEGER REFERENCES projects(id);
        
        -- Update existing deployments with project_id
        UPDATE deployments d SET project_id = p.id 
        FROM projects p 
        WHERE d.project_name = p.name;
    END IF;
END $$;
