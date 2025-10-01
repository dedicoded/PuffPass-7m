-- Create SQL views for age verification compliance monitoring

-- View 1: Pass/Fail Rate Summary
CREATE OR REPLACE VIEW age_verification_pass_fail_rate AS
SELECT 
  action,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM age_verification_logs
WHERE action IN ('pass', 'fail')
GROUP BY action
ORDER BY count DESC;

-- View 2: Top Routes Triggering Verification
CREATE OR REPLACE VIEW age_verification_top_routes AS
SELECT 
  route,
  COUNT(*) as access_count,
  COUNT(CASE WHEN action = 'pass' THEN 1 END) as passes,
  COUNT(CASE WHEN action = 'fail' THEN 1 END) as failures,
  ROUND(COUNT(CASE WHEN action = 'pass' THEN 1 END) * 100.0 / COUNT(*), 2) as pass_rate
FROM age_verification_logs
WHERE action IN ('pass', 'fail')
GROUP BY route
ORDER BY access_count DESC
LIMIT 20;

-- View 3: Suspicious IPs (multiple failures)
CREATE OR REPLACE VIEW age_verification_suspicious_ips AS
SELECT 
  ip_address,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN action = 'fail' THEN 1 END) as failures,
  COUNT(CASE WHEN action = 'pass' THEN 1 END) as passes,
  MAX(created_at) as last_attempt,
  ARRAY_AGG(DISTINCT route) as attempted_routes
FROM age_verification_logs
WHERE ip_address IS NOT NULL
GROUP BY ip_address
HAVING COUNT(CASE WHEN action = 'fail' THEN 1 END) >= 3
ORDER BY failures DESC, total_attempts DESC
LIMIT 50;

-- View 4: Daily Verification Trends (last 30 days)
CREATE OR REPLACE VIEW age_verification_daily_trends AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_events,
  COUNT(CASE WHEN action = 'pass' THEN 1 END) as passes,
  COUNT(CASE WHEN action = 'fail' THEN 1 END) as failures,
  COUNT(CASE WHEN action = 'skip' THEN 1 END) as skips,
  COUNT(CASE WHEN action = 'challenge' THEN 1 END) as challenges,
  ROUND(COUNT(CASE WHEN action = 'pass' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as pass_rate
FROM age_verification_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View 5: Hourly Activity Pattern (for detecting bot patterns)
CREATE OR REPLACE VIEW age_verification_hourly_pattern AS
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as total_events,
  COUNT(CASE WHEN action = 'fail' THEN 1 END) as failures,
  ROUND(COUNT(CASE WHEN action = 'fail' THEN 1 END) * 100.0 / COUNT(*), 2) as failure_rate
FROM age_verification_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- View 6: User Agent Analysis (detect automation)
CREATE OR REPLACE VIEW age_verification_user_agents AS
SELECT 
  user_agent,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN action = 'fail' THEN 1 END) as failures,
  COUNT(DISTINCT ip_address) as unique_ips,
  MAX(created_at) as last_seen
FROM age_verification_logs
WHERE user_agent IS NOT NULL
GROUP BY user_agent
ORDER BY total_attempts DESC
LIMIT 50;

-- Add comments for documentation
COMMENT ON VIEW age_verification_pass_fail_rate IS 'Overall pass/fail rate for age verification';
COMMENT ON VIEW age_verification_top_routes IS 'Most accessed routes requiring age verification';
COMMENT ON VIEW age_verification_suspicious_ips IS 'IP addresses with multiple failed verification attempts';
COMMENT ON VIEW age_verification_daily_trends IS 'Daily age verification activity trends for the last 30 days';
COMMENT ON VIEW age_verification_hourly_pattern IS 'Hourly activity pattern to detect bot behavior';
COMMENT ON VIEW age_verification_user_agents IS 'User agent analysis for detecting automation';
