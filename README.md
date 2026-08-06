# Creator Studio

Mobile-first creator tools for launching Solana live campaigns.

## Prerequisites

- Node.js >= 18
- npm >= 9

## Setup

```bash
cd creator-studio
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SOLANA_CLUSTER` | Solana cluster (`devnet` or `mainnet`) | `devnet` |
| `VITE_TREASURY_ADDRESS` | Treasury / escrow wallet public key | — |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run linter |
| `npm run preview` | Preview production build |

## Deployment

Build artifacts are generated in `creator-studio/dist/`. Deploy to Vercel, Netlify, or any static host.
