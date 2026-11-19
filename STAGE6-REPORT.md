# Tools Empire — Stage 6 Report: Testing, Performance and SEO

**Date:** 2026-11-17
**Status:** ✅ Complete — committed test suite (75/75 pass), performance measured, sitemap/robots live and verified against the production build. Production build and lint both pass.
**Scope:** Stage 6 only. Nothing published, deployed, pushed to GitHub, or purchased. No git repo initialised (Stage 7).

## 1. Testing — Vitest, committed to the repo

### Setup

| Item | Detail |
|---|---|
| Runner | Vitest `^3.2.7` (devDependency only, 41 packages added) |
| Script | `"test": "vitest run"` in `package.json` |
| Location | `src/lib/utils/__tests__/` (4 files) + `src/lib/__tests__/tools.test.ts` |

**Version note:** `npm install vitest` first failed — vitest 5.1.0 requires `@types/node ^22 || >=24` as a peer, conflicting with the project's `@types/node ^20` pin. Fix: pin `vitest@^3`, which resolved cleanly with no `--force` / `--legacy-peer-deps`. No other dependency was changed to accommodate the test runner.

### Results — `npm test`: 75/75 pass, 5 files, ~1.9s

| File | Tests | Covers |
|---|---|---|
| `utils/__tests__/text.test.ts` | 22 | Word/sentence/paragraph counts, empty input, UTF-8 bytes, reading time (200 wpm), longest word, **all 7 case styles** + empty input |
| `utils/__tests__/encoding.test.ts` | 17 | Base64 Unicode round-trip (emoji/accented), invalid Base64 rejection (bad chars, bad length), URL full vs component modes, invalid percent-encoding throws, JSON pretty/minify/sort-keys, invalid + empty JSON rejection |
| `utils/__tests__/color.test.ts` | 13 | 3-/6-digit HEX normalisation, invalid HEX → null, HEX↔RGB, RGB clamping, RGB↔HSL primaries + grey, red round-trip, full `convertColor` output |
| `utils/__tests__/generators.test.ts` | 17 | UUID v4 regex + uniqueness, count clamping (0→1, 200→100), charset building + exclude-ambiguous, password length/charset/empty-charset guard, strength labels Weak→Excellent via entropy |
| `lib/__tests__/tools.test.ts` | 6 | Registry sanity: 10 tools, unique slugs, every tool in a known category, slug/category resolution both ways, keyword search |

This replaces Stage 3's 26 assertions from a scratch script in `/tmp` (not committed) with a real, repeatable suite — all 26 of those behaviours are covered, plus 49 more. No test failures were encountered; nothing had to be fixed in the utils.

## 2. Performance — measured from the production build

Build: `npm run build` ✅ compiled in ~25s, TypeScript clean, 24 static pages (was 22 — `/sitemap.xml` and `/robots.txt` added). Note: Next 16 + Turbopack does not print a per-route "First Load JS" table, so sizes below are the actual emitted chunks.

| Asset | Raw | gzip (what a browser downloads) |
|---|---|---|
| Total `.next/static` (all JS + CSS) | 756K | — |
| Largest JS chunk (framework + React) | 229K | ~72K |
| Shared client chunk | 170K | ~47K |
| CSS (single file, all pages) | 28K | ~6.3K |
| QR chunk (`qrcode` lib + QR component) | 28K | ~10K |

- **No new runtime dependencies.** Only Vitest as a devDependency. Runtime deps unchanged: next, react, lucide-react, next-themes, qrcode.
- **System font stack — no webfont downloads.** Verified: no `next/font`, no `fonts.googleapis.com` / `fonts.gstatic.com` anywhere in `src/` or `package.json`. The `--font-sans` stack is Inter/system-ui fallbacks only.
- **QR library is now loaded only on its tool page.** See the fix below.

### QR code-splitting — found a real issue, fixed it

- **Before:** `qrcode` was imported only by `QrCodeGenerator.tsx`, but that component was statically imported by the shared `/tools/[slug]` page — and a first `next/dynamic` attempt *in the Server Component page* did not split it: the QR chunk still appeared as a `<script src>` in `word-counter.html`.
- **Fix (cheap, no refactor):** new `src/components/tools/QrCodeGeneratorLazy.tsx` — a Client Component that does the `next/dynamic` import. The page now renders `<QrCodeGeneratorLazy />` for that slug only.
- **Verified in built HTML:** the QR chunk (`24r6lzik5sxwj.js`, 28K) is referenced in `qr-code-generator.html` (1 mention, lazy chunk in flight data) and in **0** of `word-counter.html`, `password-generator.html`, `index.html`, `tools.html`, `categories.html`. The QR page still server-renders its UI ("Enter text" label present in prerendered HTML).

## 3. SEO

### New files

| File | What it is |
|---|---|
| `src/lib/seo.ts` | `SITE_URL` (single canonical base URL) + `toolJsonLd()` helper |
| `src/app/sitemap.ts` | Dynamic sitemap from the registry: home, `/tools`, `/categories`, 4 category pages, 10 tool pages = **17 URLs** |
| `src/app/robots.ts` | `User-Agent: * / Allow: /`, `Sitemap: <SITE_URL>/sitemap.xml` |

### Metadata polish

| Page | Change |
|---|---|
| Root `layout.tsx` | Added `metadataBase: new URL(SITE_URL)` so canonical/OG URLs resolve absolutely |
| `tools/[slug]/page.tsx` | `generateMetadata` now adds `keywords` (from registry), `alternates.canonical`, Open Graph (title/description/url/type) and Twitter card. Page renders a JSON-LD `<script type="application/ld+json">` — `SoftwareApplication` with name, description, URL, `applicationCategory: UtilitiesApplication`, `operatingSystem: Any`, `isAccessibleForFree: true`, free Offer. **No ratings or reviews** — nothing claimed that cannot be backed up. |
| `categories/[slug]/page.tsx` | Added canonical + Open Graph to `generateMetadata` |
| `/`, `/tools`, `/categories` | Added canonical (+ OG URL) metadata |

### ⚠️ Placeholder domain — must be updated in Stage 7

There is no live domain yet, so `SITE_URL` defaults to `https://tools-empire.vercel.app` (override with `NEXT_PUBLIC_SITE_URL`). This is a clearly-commented placeholder in `src/lib/seo.ts`: when the real domain is known, change that **one value** and every canonical URL, sitemap entry and JSON-LD URL updates with it. All sitemap/canonical values below use this placeholder until then.

### Verification — production smoke test (`npx next start -p 3106` + curl)

| Check | Result |
|---|---|
| Routes → 200 | ✅ 10/10: `/`, `/tools`, `/categories`, `/categories/text-tools`, `/categories/generators`, `/tools/word-counter`, `/tools/qr-code-generator`, `/tools/color-converter`, `/sitemap.xml`, `/robots.txt` |
| `/sitemap.xml` | ✅ 200, exactly **17 `<loc>` entries** — home, `/tools`, `/categories`, all 4 category URLs, all 10 tool URLs |
| `/robots.txt` | ✅ 200 — `User-Agent: *`, `Allow: /`, `Sitemap: https://tools-empire.vercel.app/sitemap.xml` |
| JSON-LD | ✅ `application/ld+json` + `SoftwareApplication` present on `/tools/qr-code-generator` and `/tools/word-counter` |
| Canonical | ✅ `rel="canonical"` present on both tool pages checked, pointing at the `tools-empire.vercel.app` URLs |
| Server cleanup | ✅ Killed with `fuser -k 3106/tcp`; port confirmed closed afterwards; no `next-server` process left running |

One observation: the build lists `/sitemap.xml` as ƒ (Dynamic, server-rendered on demand) rather than static. It still serves correctly (200, correct content) and is cheap — no action taken.

## Verification (exact results)

| Check | Command | Result |
|---|---|---|
| Tests | `npm test` | ✅ **75/75 pass, 5 files, ~1.9s** |
| Lint | `npm run lint` | ✅ **Passed** — exit 0, no errors/warnings (test files included) |
| Production build | `npm run build` | ✅ **Passed** — compiled, TypeScript clean, 24 static pages |
| Smoke test | `npx next start -p 3106` + curl | ✅ **10/10 routes 200**, sitemap 17 URLs, robots correct, JSON-LD + canonical verified |

## Files created

| File | What it is |
|---|---|
| `src/lib/utils/__tests__/text.test.ts` | 22 tests — counts + all 7 case styles |
| `src/lib/utils/__tests__/encoding.test.ts` | 17 tests — Base64, URL, JSON |
| `src/lib/utils/__tests__/color.test.ts` | 13 tests — HEX/RGB/HSL |
| `src/lib/utils/__tests__/generators.test.ts` | 17 tests — UUID, password, strength |
| `src/lib/__tests__/tools.test.ts` | 6 tests — registry sanity |
| `src/lib/seo.ts` | `SITE_URL` + `toolJsonLd()` |
| `src/app/sitemap.ts` | Registry-driven sitemap (17 URLs) |
| `src/app/robots.ts` | robots.txt (allow all + sitemap) |
| `src/components/tools/QrCodeGeneratorLazy.tsx` | Client-component lazy wrapper for the QR tool |

## Files changed

| File | Change |
|---|---|
| `package.json` / `package-lock.json` | `vitest ^3.2.7` (dev), `"test": "vitest run"` script |
| `src/app/layout.tsx` | `metadataBase` added |
| `src/app/tools/[slug]/page.tsx` | Full metadata (canonical/OG/Twitter/keywords) + JSON-LD script; QR tool via lazy wrapper |
| `src/app/categories/[slug]/page.tsx` | Canonical + OG metadata |
| `src/app/page.tsx`, `src/app/tools/page.tsx`, `src/app/categories/page.tsx` | Canonical metadata |

## Remaining gaps / next step

- **Placeholder domain** (`https://tools-empire.vercel.app`) — update `SITE_URL` in Stage 7 once the real Vercel domain is known.
- **No OG images** — Open Graph metadata has no `images` (no branded OG image was designed in any stage). Pages still share correctly with title/description; an OG image is optional polish.
- **No real-browser testing** — carried over from Stage 5: theme toggle click, `/` + `Esc` keys, Copy buttons, QR download and visual rendering at 360/768/1280px still need a live browser (after deploy, or a browser task).
- **No Lighthouse run** — no headless-browser tooling in this environment; the chunk-size numbers above are the performance evidence so far.

Stage 7: GitHub repository + Vercel deployment.
