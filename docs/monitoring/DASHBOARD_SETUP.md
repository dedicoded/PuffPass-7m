# Web3 Health Monitoring Dashboard Setup

## Overview
This dashboard provides real-time operational visibility into PuffPass Web3 connection health, making the health system actionable for operations teams and complementing the audit/compliance logging.

## Key Metrics Tracked

### 🟢 Connection Status
- **Real-time status**: Connected/Disconnected
- **Data source**: Latest `web3_health_metrics` record
- **Alert threshold**: Any disconnection

### 📊 Uptime Percentage (24h)
- **Calculation**: Average uptime over 24 hours
- **Green**: ≥99% uptime
- **Yellow**: 95-99% uptime  
- **Red**: <95% uptime

### ⚠️ Error Rate (1h)
- **Calculation**: `(connection_errors / connection_attempts) * 100`
- **Green**: <5% error rate
- **Yellow**: 5-10% error rate
- **Red**: >10% error rate

### ⏱️ Average Latency (1h)
- **Measurement**: Average connection latency in milliseconds
- **Green**: <1000ms
- **Yellow**: 1000-3000ms
- **Red**: >3000ms

## Dashboard Panels

### 1. Status Overview (Top Row)
- Connection Status indicator
- 24h Uptime percentage
- 1h Error rate
- 1h Average latency

### 2. Trend Analysis (Middle Row)
- Connection success rate over 24h
- Latency trends (avg/max) over 24h

### 3. Error Logs (Bottom Row)
- Recent error messages with timestamps
- Filterable and searchable

## Setup Instructions

### Grafana Setup
1. Import `grafana-dashboard.json` into your Grafana instance
2. Configure data source to point to your PostgreSQL database
3. Set up alerts for critical thresholds
4. Configure notification channels (Slack, email, PagerDuty)

### Datadog Setup
1. Import `datadog-dashboard.yaml` using Datadog API or UI
2. Configure database integration for PostgreSQL
3. Set up monitors for SLA violations
4. Configure notification integrations

## Recommended Alerts

### Critical Alerts (PagerDuty/SMS)
- Web3 connection down for >5 minutes
- Error rate >25% for >10 minutes
- Latency >5000ms for >15 minutes

### Warning Alerts (Slack/Email)
- Uptime <99% over 1 hour
- Error rate >10% for >5 minutes
- Latency >3000ms for >10 minutes

## Operational Runbook

### Connection Down
1. Check WalletConnect API status
2. Verify network connectivity
3. Review recent deployments
4. Check environment variables
5. Restart Web3Provider if needed

### High Error Rate
1. Review error logs in dashboard
2. Check for API rate limiting
3. Verify project ID configuration
4. Monitor for DDoS or unusual traffic

### High Latency
1. Check network conditions
2. Review WalletConnect relay performance
3. Consider switching to backup endpoints
4. Monitor for geographic routing issues

## Integration with Compliance

This dashboard complements your existing compliance monitoring by:
- Providing real-time operational visibility
- Generating audit trails via `web3_health_metrics` table
- Supporting regulatory reporting requirements
- Enabling proactive issue resolution

## Maintenance

- Dashboard refreshes every 30 seconds
- Metrics retained for 90 days (configurable)
- Weekly review of alert thresholds
- Monthly dashboard optimization review
