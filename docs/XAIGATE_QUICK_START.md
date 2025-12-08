# XaiGate Quick Start Guide

Get started with XaiGate crypto payments in 5 minutes.

## 1. Get Your API Key (2 minutes)

1. Go to [wallet.xaigate.com](https://wallet.xaigate.com) and sign up
2. Navigate to **Credential** in the left sidebar
3. Copy your API Key (looks like: `60472f18-d709-47f0-9e65-2eaaf33991a7`)
4. **Toggle "Enable APIKey" to "Yes"**

![XaiGate Credential Page](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ni3ASrflklH8BfOxxpplAckwN1boXm.png)

## 2. Add to Environment Variables (1 minute)

In your Vercel project:

\`\`\`bash
XAIGATE_API_KEY=your_api_key_here
\`\`\`

## 3. Configure Webhook (1 minute)

1. Go to **Webhook** in XaiGate dashboard
2. Add your webhook URL: `https://your-domain.com/api/xaigate/webhook`
3. Enable deposit notifications
4. Save

## 4. Test Payment (1 minute)

1. Go to `/onramp` in your app
2. Enter amount and create payment
3. Send test USDC to the generated address
4. Watch for confirmation

## Done!

Your XaiGate integration is ready. See [XAIGATE_SETUP_GUIDE.md](./XAIGATE_SETUP_GUIDE.md) for detailed configuration.

## Key Features

- **Multi-Network Support**: Ethereum, BSC, Tron
- **Fast Confirmations**: 3-15 seconds depending on network
- **Low Fees**: $0.10-$5 per transaction
- **Automatic Crediting**: PUFF tokens credited on confirmation
- **Real-time Webhooks**: Instant payment notifications

## Recommended Network

**BSC (BEP20)** - Best balance of speed and cost:
- Confirmation time: ~3 seconds
- Transaction fee: ~$0.10-0.50
- High reliability

## Support

- [Full Setup Guide](./XAIGATE_SETUP_GUIDE.md)
- [API Reference](./XAIGATE_API_REFERENCE.md)
- [XaiGate Docs](https://xaigate.gitbook.io/api-docs/)
