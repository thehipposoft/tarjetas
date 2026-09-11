# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Standing rules (apply to every project using this file as a template)

These are non-negotiable defaults — follow them even if not repeated in a
specific task request.

- **TypeScript only.** No new `.js`/`.jsx` source files; `strict` stays on in
  `tsconfig.json`.
- **Check for latest versions before touching core packages.** Before adding
  or upgrading React, Next.js, or Tailwind CSS, check the current published
  version (e.g. `npm view <pkg> version`) rather than assuming the version
  already in `package.json` or from training data is current. Prefer the
  latest stable release unless the user asks to pin or the project has a
  documented reason not to upgrade.
- **Tailwind CSS for all styling.** Don't introduce CSS-in-JS, styled-components,
  Sass, or a competing utility framework. Plain CSS is only for the handful of
  global/theme declarations in `globals.css`.
- **Ask for the main colours before building UI on a new project**, and encode
  the answer as CSS variables / `@theme` tokens (Tailwind v4 style) rather
  than hardcoding hex values throughout components. If a project's colour is
  inherently per-tenant/data-driven (as in this repo), say so explicitly
  instead of guessing a palette.
- **Always create `.vscode/settings.json`** with `"editor.tabSize": 4` for a
  new project (already done here — see that file before changing it).

## This project: Tarjetas

Digital business card platform for **The Hipposoft**. Physical PVC cards with
an NFC (NTAG215) chip and a QR code link to a person's digital profile.

### Stack

- **Next.js 16** (App Router, React Server Components by default)
- **React 19**
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4** (CSS-first config via `@theme inline` in
  [globals.css](src/app/globals.css) — no `tailwind.config.js`)
- Package manager: **yarn** (`yarn.lock` is committed; don't add `package-lock.json`)
- ESLint 9 flat config ([eslint.config.mjs](eslint.config.mjs)) extending
  `eslint-config-next`

Check installed versions against latest before upgrading: this repo currently
tracks `next@^16.3.4`, `react@^19.3.0`, `tailwindcss@^4` — confirm with
`npm view <pkg> version` since these move fast.

### Data model & phasing

The whole app is designed around **one seam**: [src/lib/data.ts](src/lib/data.ts).

- **Phase 1 (current):** hardcoded arrays (`companies`, `people`, `cards`) in
  that file, queried through plain functions (`getCompany`, `getPerson`,
  `getCardById`, etc.).
- **Phase 2 (planned):** swap the *bodies* of those functions for WPGraphQL
  queries against a headless WordPress backend. No page, route, or component
  should need to change — only `src/lib/data.ts`.

When adding a feature, always go through the exported functions in
`data.ts` rather than reaching into the hardcoded arrays directly, and add new
data access as a new exported function there — this is what keeps the Phase 2
swap painless.

Types live in [src/types/card.ts](src/types/card.ts): `Company`, `Person`,
`Card`, `CardStatus`, `SocialLinks`, `Branding`, `CtaLink`.

### URL structure

| Route | Purpose |
|---|---|
| `/{company}` | Company profile / link-in-bio landing (e.g. `/rada`) — [src/app/[company]/page.tsx](src/app/[company]/page.tsx) |
| `/{company}/{person}` | Individual digital profile (e.g. `/rada/tomas-borigen`) — [src/app/[company]/[person]/page.tsx](src/app/[company]/[person]/page.tsx) |
| `/{company}/qr` | Standalone QR code for a company's landing page, for print (flyers/posters), not the NFC flow — [src/app/[company]/qr/page.tsx](src/app/[company]/qr/page.tsx) |
| `/c/{cardId}` | Physical card routing layer (NFC/QR target); resolves a card to its current profile so the chip never needs reprogramming — [src/app/c/[cardId]/route.ts](src/app/c/[cardId]/route.ts) |

`/{company}/qr` generates its QR server-side with the `qrcode` package, pointed
at `absoluteUrl(\`/${company.slug}\`)` from [src/lib/site.ts](src/lib/site.ts)
(`SITE_URL`, overridable via `NEXT_PUBLIC_SITE_URL` for non-production
deployments). Keep the code itself black-on-white regardless of branding —
colorizing QR modules risks scan reliability — and limit brand color to a
small accent.

`/c/{cardId}` is a route handler, not a page: it 302-redirects to
`/{company}/{person}`, or to `/` if the card ID isn't found. A `TODO(phase 2)`
marks where scan analytics (NFC vs QR, timestamp, device) should be recorded
once storage exists — do this *before* the redirect, not after.

### Branding / colours

Colour is **per-company, data-driven** — not a fixed site palette. Each
`Company.branding.primaryColor` (hex string) is applied inline via
`style={{ backgroundColor: brand }}` in the company/person pages, since
Tailwind can't generate utility classes for arbitrary runtime values. The app
shell itself (home page, 404s, etc.) uses Tailwind's default neutral/gray
scale — no custom base theme has been requested.

If a future task needs static Tailwind classes for brand colour (e.g. a
"badge" component), ask which companies need it and consider generating
per-company CSS variables at request time rather than hardcoding a palette.

### Conventions

- Path alias `@/*` → `src/*` (see [tsconfig.json](tsconfig.json)).
- Pages are async Server Components; dynamic route params are `Promise`-typed
  and must be `await`ed (Next 15+/16 convention) — see the `params` prop in
  both `[company]` pages.
- Icons are hand-rolled inline SVG components in
  [src/components/icons.tsx](src/components/icons.tsx) (no icon library
  dependency) — follow that pattern for new icons rather than pulling in
  `lucide-react`/`heroicons`/etc. unless asked.
- Mobile-first, card-shaped layouts: pages are constrained with
  `max-w-[430px]` and centered — match this for new profile-style pages.
- Fonts: `Geist` / `Geist Mono` via `next/font/google`, exposed as CSS
  variables and wired into Tailwind's `@theme inline` block.

### Commands

```bash
yarn install
yarn dev      # http://localhost:3000
yarn build
yarn start
yarn lint
```

No test runner is configured yet.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
