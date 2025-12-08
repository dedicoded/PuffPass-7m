# PuffPass Team Onboarding Guide

Welcome to the PuffPass development team! This guide will help you get up to speed quickly.

---

## Quick Start

### 1. Clone & Install

\`\`\`bash
git clone [repository-url]
cd puffpass
pnpm install
\`\`\`

### 2. Environment Setup

Copy the example environment file and fill in values:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Required variables (ask team lead for values):
- `DATABASE_URL` - Neon PostgreSQL connection
- `JWT_SECRET` - Authentication secret
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` - Upstash Redis

### 3. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Visit `http://localhost:3000`

### 4. Run Database Migrations

\`\`\`bash
pnpm db:migrate
# Or via API: POST /api/db/migrate
\`\`\`

---

## Key Documentation

| Document | Purpose |
|----------|---------|
| [WHITEPAPER.md](./WHITEPAPER.md) | Protocol overview, business model |
| [STACK_CORE.md](./STACK_CORE.md) | Technical stack, API reference |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Current progress, priorities |
| [POLYGON_DEPLOYMENT_GUIDE.md](./POLYGON_DEPLOYMENT_GUIDE.md) | Contract deployment |

---

## Architecture Overview

\`\`\`
User → Next.js Frontend → API Routes → Database/Blockchain
                                    ↓
                          PuffPassRouter (Polygon)
                                    ↓
                          USDC Stablecoin Transfers
\`\`\`

**Key Flow:**
1. Consumer browses products
2. Adds items to cart
3. Connects wallet (MetaMask)
4. Pays via PuffPassRouter contract
5. 3% fee goes to treasury
6. 97% credited to merchant vault
7. Daily batch settlement sends USDC to merchants

---

## Important Files to Know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page |
| `app/layout.tsx` | Root layout, providers |
| `components/polygon-payment.tsx` | USDC payment component |
| `contracts/PuffPassRouter.sol` | Core payment contract |
| `lib/db.ts` | Database connection |
| `lib/auth.ts` | Authentication utilities |
| `lib/polygon-batch-service.ts` | Batch settlement logic |

---

## Development Workflow

### Branch Naming

\`\`\`
feature/description    - New features
fix/description        - Bug fixes
docs/description       - Documentation
refactor/description   - Code refactoring
\`\`\`

### Commit Messages

\`\`\`
feat: Add merchant withdrawal component
fix: Resolve ethers v6 compatibility issue
docs: Update API reference
refactor: Consolidate auth patterns
\`\`\`

### Pull Request Process

1. Create feature branch
2. Make changes
3. Run `pnpm lint` and `pnpm build`
4. Create PR with description
5. Request review
6. Address feedback
7. Merge after approval

---

## Common Tasks

### Add a New API Endpoint

\`\`\`typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await validateSession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  return NextResponse.json({ data: "example" })
}
\`\`\`

### Add a New Component

\`\`\`tsx
// components/example-component.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExampleComponentProps {
  title: string
}

export function ExampleComponent({ title }: ExampleComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content here */}
      </CardContent>
    </Card>
  )
}
\`\`\`

### Add a Database Migration

1. Create file: `scripts/xxx-description.sql`
2. Write SQL statements
3. Run via `/api/db/migrate` or `pnpm db:migrate`

---

## Debugging Tips

### Enable Debug Logging

\`\`\`typescript
console.log("[v0] Debug message:", variable)
\`\`\`

### Check Database Connection

\`\`\`bash
curl http://localhost:3000/api/test-db-connection
\`\`\`

### Check Blockchain Connection

\`\`\`bash
curl http://localhost:3000/api/web3/health
\`\`\`

### View Server Logs

Check the terminal running `pnpm dev` for server-side logs.

---

## Getting Help

1. Check existing documentation in `/docs`
2. Search codebase with grep: `grep -r "keyword" .`
3. Ask in team chat
4. Schedule pairing session with team lead

---

## First Week Checklist

- [ ] Complete local setup
- [ ] Read WHITEPAPER.md
- [ ] Read STACK_CORE.md
- [ ] Explore the codebase
- [ ] Make a small contribution (fix typo, improve docs)
- [ ] Shadow a team member on their task
- [ ] Ask questions!

Welcome aboard!
