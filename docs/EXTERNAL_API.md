# PuffPass External API Documentation

## Overview

The PuffPass External API allows third-party applications to integrate payment processing capabilities into their systems. This RESTful API provides endpoints for creating payments, checking status, and receiving real-time notifications via webhooks.

## Base URL

\`\`\`
Production: https://api.puffpass.app/v1
Sandbox: https://sandbox-api.puffpass.app/v1
\`\`\`

## Authentication

All API requests require an API key passed in the `X-API-Key` header:

\`\`\`bash
curl -H "X-API-Key: pk_your_api_key_here" \
  https://api.puffpass.app/v1/payments/status?paymentId=PAY-xxx
\`\`\`

### Getting an API Key

Contact your PuffPass account manager or create one from the merchant dashboard.

## Rate Limits

- **Payment Creation**: 100 requests per minute
- **Status Checks**: 1000 requests per minute
- **Webhook Registration**: 10 requests per minute

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Endpoints

### Create Payment

Creates a new payment transaction.

**Endpoint**: `POST /v1/payments/create`

**Request Body**:
\`\`\`json
{
  "amount": 100.50,
  "currency": "USDC",
  "fromAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f3f8a",
  "toAddress": "0x8b3c4e2f9d1a5c7b6e8f0a3d2c1b4e5f6a7b8c9d",
  "metadata": {
    "orderId": "ORD-12345",
    "customerId": "CUST-67890"
  }
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "paymentId": "PAY-1234567890-abc123",
  "status": "pending",
  "amount": 100.50,
  "currency": "USDC",
  "fromAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f3f8a",
  "toAddress": "0x8b3c4e2f9d1a5c7b6e8f0a3d2c1b4e5f6a7b8c9d",
  "riskScore": 15,
  "createdAt": "2025-01-15T10:30:00Z"
}
\`\`\`

### Get Payment Status

Retrieves the current status of a payment.

**Endpoint**: `GET /v1/payments/status?paymentId=PAY-xxx`

**Response**:
\`\`\`json
{
  "success": true,
  "payment": {
    "id": "PAY-1234567890-abc123",
    "amount": 100.50,
    "currency": "USDC",
    "fromAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f3f8a",
    "toAddress": "0x8b3c4e2f9d1a5c7b6e8f0a3d2c1b4e5f6a7b8c9d",
    "status": "completed",
    "transactionHash": "0xabc123...",
    "riskScore": 15,
    "metadata": {},
    "createdAt": "2025-01-15T10:30:00Z",
    "completedAt": "2025-01-15T10:31:23Z"
  }
}
\`\`\`

### Register Webhook

Registers a webhook endpoint to receive payment event notifications.

**Endpoint**: `POST /v1/webhooks/register`

**Request Body**:
\`\`\`json
{
  "url": "https://your-app.com/webhooks/puffpass",
  "events": ["payment.created", "payment.completed", "payment.failed"],
  "secret": "your_webhook_secret_optional"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "webhookId": "WH-1234567890-xyz789",
  "url": "https://your-app.com/webhooks/puffpass",
  "events": ["payment.created", "payment.completed", "payment.failed"],
  "secret": "whsec_abc123...",
  "active": true,
  "createdAt": "2025-01-15T10:30:00Z"
}
\`\`\`

## Webhooks

### Event Types

- `payment.created`: Payment transaction created
- `payment.completed`: Payment successfully completed
- `payment.failed`: Payment failed
- `payment.refunded`: Payment refunded

### Webhook Payload

\`\`\`json
{
  "event": "payment.completed",
  "paymentId": "PAY-1234567890-abc123",
  "data": {
    "amount": 100.50,
    "currency": "USDC",
    "fromAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f3f8a",
    "toAddress": "0x8b3c4e2f9d1a5c7b6e8f0a3d2c1b4e5f6a7b8c9d",
    "transactionHash": "0xabc123...",
    "status": "completed"
  },
  "timestamp": "2025-01-15T10:31:23Z"
}
\`\`\`

### Verifying Webhook Signatures

All webhooks include an `X-Webhook-Signature` header containing an HMAC SHA256 signature:

\`\`\`javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
\`\`\`

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Payment blocked by security system |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Security

### Fraud Detection

All payments are automatically screened for fraud using:
- Transaction velocity monitoring
- Pattern analysis
- Risk scoring (0-100)
- Address blocking

Payments with risk scores above 70 are automatically blocked.

### Best Practices

1. **Store API keys securely** - Never commit keys to version control
2. **Use HTTPS only** - All API calls must use HTTPS
3. **Verify webhook signatures** - Always validate webhook authenticity
4. **Implement retry logic** - Handle transient failures gracefully
5. **Monitor rate limits** - Track usage to avoid throttling

## Support

For API support, contact:
- Email: api-support@puffpass.app
- Documentation: https://docs.puffpass.app
- Status Page: https://status.puffpass.app
