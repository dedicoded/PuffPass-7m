-- Create org compliance summary view for daily pass/fail rates
CREATE OR REPLACE VIEW org_compliance_summary AS
SELECT 
  organization,
  DATE(created_at) AS day,
  COUNT(*) AS total_attempts,
  SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS passes,
  SUM(CASE WHEN NOT verified THEN 1 ELSE 0 END) AS fails,
  ROUND(100.0 * SUM(CASE WHEN verified THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) AS pass_rate
FROM age_verification_logs
WHERE organization IS NOT NULL
GROUP BY organization, DATE(created_at)
ORDER BY organization, day DESC;

-- Create org suspicious IPs view for fraud detection
CREATE OR REPLACE VIEW org_suspicious_ips AS
SELECT 
  organization,
  ip_address,
  COUNT(*) AS failures,
  MAX(created_at) AS last_failure,
  array_agg(DISTINCT route) AS targeted_routes
FROM age_verification_logs
WHERE verified = false AND organization IS NOT NULL
GROUP BY organization, ip_address
HAVING COUNT(*) > 5
ORDER BY failures DESC;

-- Add comments for documentation
COMMENT ON VIEW org_compliance_summary IS 'Daily compliance metrics per organization - pass/fail rates for regulatory reporting';
COMMENT ON VIEW org_suspicious_ips IS 'Suspicious IP addresses with repeated failures per organization - fraud detection';
