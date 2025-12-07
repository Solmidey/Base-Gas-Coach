# Base Gas Coach

A lightweight Farcaster Mini App that pairs a **live Base gas dashboard** with a **friendly Coach Mode**
for better onchain habits (bridges, swaps, and LP learning).

## Features
- Live Base gas from public RPC via `viem`.
- Rough fee estimates for transfer, ERC20 transfer, swap, and mint.
- Coach Mode with gas-aware suggestions and curated best-practice pointers.
- Sleek, glassy UI optimized for Farcaster viewports.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm start
```

## Farcaster Mini App
- Manifest lives at `public/.well-known/farcaster.json`.
- Image assets live in `public/`.

### Important setup after deploy
1. Replace `https://YOUR_DOMAIN` placeholders in the manifest with your real domain.
2. Generate your `accountAssociation` block in the Farcaster dashboard and add it to your deployed manifest file only if your flow requires it.
   This repo intentionally does not include or invent account association values.

## Disclaimer
This app provides general educational guidance and is not financial advice.
