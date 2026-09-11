# Tarjetas

Digital business card platform for The Hipposoft. Physical PVC cards with an
NFC (NTAG215) chip and a QR code link to a person's digital profile.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Phase 1 (current): hardcoded profile data in `src/lib/data.ts`
- Phase 2: swap the data layer for WordPress (headless, via WPGraphQL) — no
  page or route should need to change, only `src/lib/data.ts`

## URL structure

- `/{company}` — company profile (e.g. `/rada`)
- `/{company}/{person}` — individual digital profile (e.g. `/rada/tomas-borigen`)
- `/c/{cardId}` — physical card routing layer; resolves a card to its current
  profile so the NFC chip never needs to be reprogrammed (e.g. `/c/ABC123`)

## Getting started

```bash
yarn install
yarn dev
```

Open http://localhost:3000 — the home page links to the demo company
(`/rada`) and its demo profile (`/rada/tomas-borigen`).
