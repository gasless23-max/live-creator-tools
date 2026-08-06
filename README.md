# Live Creator Tools

Mobile-first creator studio for launching Solana live campaigns with on-chain payments and media uploads.

## Prerequisites

- Node.js >= 18
- npm >= 9

## Setup

```bash
cp .env.example .env
cp creator-studio/.env.example creator-studio/.env
npm install
npm run dev
```

## Environment Variables

### Root
No variables required.

### Frontend (`creator-studio/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SOLANA_CLUSTER` | Solana cluster (`devnet` or `mainnet`) | `devnet` |
| `VITE_TREASURY_ADDRESS` | Treasury / escrow wallet public key | — |

### Backend (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `UPLOAD_DIR` | Upload storage directory | `./uploads` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:client` | Start frontend only |
| `npm run dev:server` | Start backend only |
| `npm run build` | Production build frontend |
| `npm run lint` | Lint frontend |

## Architecture

- **Frontend**: Vite + React + Tailwind CSS (`creator-studio/`)
- **Backend**: Express + TypeScript (`server/`)
  - `POST /api/media/upload` — Upload campaign creative
  - `GET /api/campaigns` — List campaigns
  - `POST /api/campaigns` — Create campaign

## Deployment

Frontend build artifacts are in `creator-studio/dist/`. Deploy to Vercel, Netlify, or any static host. Backend can be deployed to Render, Fly.io, or any Node host.
