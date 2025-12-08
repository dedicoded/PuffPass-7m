# XaiGate API Reference

Quick reference for XaiGate API endpoints used in PuffPass.

## Base URL

\`\`\`
Production: https://wallet-api.xaigate.com/api/v1
\`\`\`

## Authentication

All requests require an API key in the header:

\`\`\`
x-api-key: YOUR_API_KEY
\`\`\`

## Endpoints

### 1. Generate Wallet Address

Create a unique wallet address for receiving payments.

**Endpoint**: `POST /address/generate`

**Request Body**:
\`\`\`json
{
  "userId": "user-123",
  "network": "BSC",
  "currency": "USDC"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "network": "BSC",
    "currency": "USDC",
    "userId": "user-123"
  }
}
\`\`\`

### 2. Get Wallet Balance

Check the balance of a wallet address.

**Endpoint**: `GET /wallet/balance`

**Query Parameters**:
- `address` - Wallet address
- `network` - Network (ETH, BSC, TRX)
- `currency` - Currency (USDC)

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "balance": "100.50",
    "currency": "USDC",
    "network": "BSC"
  }
}
\`\`\`

### 3. Get Transactions

Retrieve transaction history for a wallet.

**Endpoint**: `GET /transactions`

**Query Parameters**:
- `address` - Wallet address
- `network` - Network (ETH, BSC, TRX)
- `limit` - Number of transactions (default: 50)

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "txid": "0xabc123...",
        "from": "0x123...",
        "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "amount": "10.00",
        "currency": "USDC",
        "network": "BSC",
        "confirmations": 15,
        "status": "confirmed",
        "timestamp": "2025-01-06T12:00:00Z"
      }
    ]
  }
}
\`\`\`

## Webhook Events

### Deposit Notification

Sent when a deposit is detected.

**Payload**:
\`\`\`json
{
  "event": "deposit",
  "userId": "user-123",
  "txid": "0xabc123...",
  "from": "0x123...",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "10.00",
  "currency": "USDC",
  "network": "BSC",
  "confirmations": 1,
  "timestamp": "2025-01-06T12:00:00Z"
}
\`\`\`

### Confirmation Update

Sent when confirmations increase.

**Payload**:
\`\`\`json
{
  "event": "confirmation",
  "txid": "0xabc123...",
  "confirmations": 12,
  "status": "confirmed"
}
\`\`\`

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing API key |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Rate Limits

- **API Requests**: 100 requests per minute
- **Webhook Retries**: 5 attempts with exponential backoff

## Networks & Currencies

### Supported Networks

| Network | Code | Block Time | Avg Gas Fee |
|---------|------|------------|-------------|
| Ethereum | ETH | ~15 sec | $2-10 |
| BSC | BSC | ~3 sec | $0.10-0.50 |
| Tron | TRX | ~3 sec | $1-2 |

### Supported Currencies

- USDC (USD Coin)
- USDT (Tether)
- ETH (Ethereum)
- BNB (Binance Coin)
- TRX (Tron)

---

For complete API documentation, visit: [xaigate.gitbook.io/api-docs](https://xaigate.gitbook.io/api-docs)
