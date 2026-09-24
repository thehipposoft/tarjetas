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

The `/{company}` page's "Ubicación" section renders whenever
`mapEmbedSrc(company)` ([src/lib/maps.ts](src/lib/maps.ts)) returns something —
not gated on `company.address` alone. That helper parses the exact pin
coordinates out of `googleMapsUrl`'s `!3d{lat}!4d{lng}` segment when present
(more precise than a text search, and works even without a real street
address on hand yet — see RADA), falling back to a text query on `address`
when there's no Maps URL. The address paragraph itself only renders when
`company.address` is actually set — never fabricate one.
The map `<iframe>` is flexible (`flex-1 min-h-24 max-h-64`), not a fixed
height: it takes whatever space the card has left so small phones (e.g. iPhone
8, 375×667) don't need to scroll; only very small screens (~320×568) fall back
to the inner scroll region.

`/c/{cardId}` is a route handler, not a page: it 302-redirects to
`/{company}/{person}`, or to `/` if the card ID isn't found. A `TODO(phase 2)`
marks where scan analytics (NFC vs QR, timestamp, device) should be recorded
once storage exists — do this *before* the redirect, not after.

### Branding / colours

Colour is **per-company, data-driven** — not a fixed site palette. Each
`Company.branding.primaryColor`/`secondaryColor` is resolved via
`brandBackground()` in [src/lib/branding.ts](src/lib/branding.ts) (solid
color, or a gradient when `secondaryColor` is set) and applied as an inline
`style`, since Tailwind can't generate utility classes for arbitrary runtime
values. The person page uses the *same* `brandBackground(company.branding)` —
a person's profile always matches their company's exact colors, gradient
included, never a separate palette. The app shell itself (home page, 404s,
etc.) uses Tailwind's default neutral/gray scale — no custom base theme has
been requested.

Link-in-bio style buttons (icon + label, brand-colored) go through the shared
[`CtaButton`](src/components/cta-button.tsx) component — used for the company
page's own `links` list, and reused on the person page for "Seguinos"/
"Conocé {company}" so those stay in exact sync with the company's own
`links` entries (same label, same url — looked up by `icon`, not
re-typed). A person's WhatsApp button, though, always uses that person's own
number (`person.social.whatsapp`), not the company's.

`CtaButton` also takes an optional `primaryColor` prop, rendered as the
button's border on both variants — pass `company.branding.primaryColor` at
every call site so every CTA stays tied to the card's own color. On the
"row" variant it also becomes the fill (`backgroundColor: primaryColor`, white
icon/text/chevron — solid color only, no gradient); on the "solid" variant the
border matches the brand-colored/gradient fill, so it reads as a subtle edge.
Omit the prop only for a context with no brand color to pass: "row" then falls
back to a neutral gray pill with a gray border.

If a future task needs static Tailwind classes for brand colour (e.g. a
"badge" component), ask which companies need it and consider generating
per-company CSS variables at request time rather than hardcoding a palette.

Both the company and person pages are framed as a literal card: a
`bg-neutral-100` backdrop (local to each page — not a site-wide change)
behind a white `<main>` with `shadow-xl`, rounded corners, and a `border-2`
colored via inline `style={{ borderColor: company.branding.primaryColor }}`
(primary color only — a gradient can't cleanly become a border). The `/qr`
page intentionally does *not* get this treatment — it's meant to be
printed/scanned, not browsed as a card.

Both pages follow a business-card look (modeled on a reference design). The
person page: the company logo bleeds off the top-left corner (positioned
with a negative offset; the card's own `overflow-hidden` clips it into a
corner "sticker" — no separate circular mask needed), the person's photo
gets a `border-4` ring in `primaryColor`. Both pages render their
CTAs/contact links as pill rows with a trailing chevron
(`CtaButton`'s `variant="row"`, filled with `primaryColor`, white text/icons). Two optional `Company` fields drive the person
page's taglines, both `\n`-joined multi-line strings and both no-ops when
unset: `tagline` (top-right, gray uppercase + a short accent-color
underline) and `footerTagline` (bottom-right, same styling, sitting beside —
not on top of — the bottom-left accent shape described below). Keep footer
tagline text off the shape itself: the shape only covers the corner, so text
placed over it instead of beside it would need a different color
per-company to stay legible, which defeats the point of it being a generic,
data-driven field. The company page has no `footerTagline` slot — it renders
the same accent shape purely as decoration, with no text.

The bottom-left accent shape is an inline `<svg>` (a diagonal wedge + accent
line, not a plain rotated rectangle), colored via `company.branding.primaryColor`
on `fill`/`stroke` rather than a hardcoded color, so it stays data-driven per
company, and shared (copy-pasted, not extracted — it's two short `<path>`s)
between both pages. The company page's copy is sized smaller (`h-20 w-27`
vs. the person page's `h-32 w-48`) since that page has no reserved footer
band the way the person page does — its content area is a variable-height
scroll region that can run close to the card's bottom edge (e.g. RADA's map
+ "Ver en Google Maps" link), so a large bleed risks overlapping real
content at small viewports. `pointer-events-none` on the shape means even
where it does overlap something, it never blocks a tap. Two things to
keep in mind if this shape is touched again:
- It must be a **direct child of `main`** (not nested inside the small
  `footerTagline` wrapper div on the person page), and that wrapper must not
  itself have `overflow-hidden` — the bleed should be clipped by `main`'s
  own `overflow-hidden` + rounded corner (same mechanism as the top-left
  logo bleed), not by an inner box.
- **`viewBox` must be cropped tightly to the shape's own bounding box.** A
  `viewBox` with a lot of empty space around the actual path (e.g. a small
  shape inside a much larger `0 0 600 400` box) reliably fails to paint at
  all in this browser when the `<svg>` sits inside a heavily-downscaled,
  clipped ancestor — confirmed by isolating the exact same `<path>` in a
  standalone HTML file (renders fine there) vs. injecting it into this page
  (invisible) vs. re-cropping the `viewBox` to the shape's actual extent
  (renders fine again). This is a second empirically-confirmed SVG/clipping
  rendering quirk in this environment, alongside the earlier negative-z-index-
  inside-overflow-hidden one — if a future shape here goes invisible for no
  apparent reason (correct computed styles, correct attributes, correct DOM
  position), suspect the `viewBox` size relative to the drawn content before
  anything else.

Both profile pages (`/{company}` and `/{company}/{person}`) are wrapped in
[`FlipCard`](src/components/flip-card.tsx), a client component driven by
**GSAP** (`gsap`, plain `gsap.to`/`gsap.set`, no `@gsap/react`). A horizontal
swipe (touch or mouse drag) flips the card to a back face with a QR code of
that page's own canonical URL (`absoluteUrl(...)`, generated server-side by
`createQrSvg` in [src/lib/qr.ts](src/lib/qr.ts), shared with the `/qr` page)
plus an underlined "Copiar enlace" button (copies the URL, briefly shows "¡Enlace copiado!") and a "Volver" button. Notes for future changes:
- `FlipCard` owns the outer size (`max-w-107.5`, `max-h-184`, `h-full`); the
  page passes its `<main>` as `children` with `h-full w-full`, not the old
  sizing classes.
- Vertical gestures are left to inner scroll regions (`touch-pan-y` on the
  root and all descendants); the card only starts dragging once horizontal
  movement wins. A drag that ends on a link suppresses the click.
- The hidden face is `inert`, so links/buttons on it can't be focused or
  tapped. Reduced-motion users get an instant flip.
- The Google Maps `<iframe>` swallows pointer events (cross-origin), so a
  swipe that starts on the map won't flip the card.
- The QR encodes `SITE_URL`, so on localhost it points at the production
  domain unless `NEXT_PUBLIC_SITE_URL` is set.
- There's no visible affordance for the swipe (no button on the front face).

`Branding.logoBackground` (optional boolean, default `true`) controls whether
the brand color/gradient renders behind the logo circle — see
[src/lib/branding.ts](src/lib/branding.ts)'s `logoBackgroundStyle()`. Set it
to `false` when a company's logo file already has its own opaque background
(RADA's SVG badge); leave it on/omitted when the logo has a transparent
background and needs a backdrop for contrast (Dycar's wordmark PNG with white
text). The flag never blanks the initials fallback when there's no
`logoUrl` — that always needs its colored backdrop to stay legible.

### Analytics

Site-wide Google Analytics (gtag.js) is loaded from
[src/components/google-analytics.tsx](src/components/google-analytics.tsx),
rendered once in the root layout ([layout.tsx](src/app/layout.tsx)) — not
per-page. Uses `next/script` with `strategy="afterInteractive"` rather than
raw `<script>` tags (Next's recommended way to load third-party scripts).
The measurement ID defaults to this project's (`G-8C8ZD033W9`) but is
overridable via `NEXT_PUBLIC_GA_MEASUREMENT_ID` so a project copied from this
template doesn't silently inherit it.

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
- Every dynamic route (`[company]`, `[company]/[person]`, `[company]/qr`)
  exports `generateMetadata` — title (via the root layout's `%s | Hippo
  Tarjetas` template), description, `alternates.canonical`, and Open
  Graph/Twitter tags using the entity's own logo/photo as the preview image.
  Falls back to `company.slug` when `company.name` is empty (as it currently
  is for one company) rather than producing a blank/broken title. The `/qr`
  variant sets `robots: { index: false, follow: false }` since it's a
  scan/print utility, not a page meant to be found or shared as a link.

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
