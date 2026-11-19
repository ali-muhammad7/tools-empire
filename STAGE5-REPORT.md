# Tools Empire — Stage 5 Report: Responsive Design + Dark/Light Polish

**Date:** 2026-11-17
**Status:** ✅ Complete — responsive + dark/light audit done, fixes applied. Production build and lint both pass; smoke-tested against the built site.
**Scope:** Stage 5 only. Nothing published, deployed, pushed to GitHub, or purchased. No git repo initialised (Stage 7). No new dependencies.

## Issues found and fixed

| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | QR image overflowed a 360px screen: `<img width={320}>` had no max-width, while the card inner width at 360px is ~296px | `QrCodeGenerator.tsx` | Added `max-w-full h-auto` to the QR `<img>` |
| 2 | UUIDs were truncated with an ellipsis on narrow screens, hiding most of the value | `UuidGenerator.tsx` | Row now stacks vertically on mobile (`flex-col sm:flex-row`), UUID wraps with `break-all` so the full value is visible; Copy button `shrink-0` |
| 3 | Brand-indigo text failed WCAG AA in dark mode: `#6366f1` on `#0b1120` is ~4.2:1 (needs 4.5:1 for normal text) | `globals.css`, all `text-brand` text usages | New `--brand-text` token — indigo-700 (`#4338ca`, ~7:1) in light, indigo-300 (`#a5b4fc`, ~8:1) in dark. All text/icon `text-brand` usages switched to `text-brand-text`; `bg-brand` buttons unchanged (white on indigo still passes) |
| 4 | Color Converter format rows could overflow at 360px (swatch + label + value + Copy button ≈ 370px) | `ColorConverter.tsx` | Rows now `flex-wrap`, value column `min-w-0 flex-1`, values `break-all`, Copy buttons `shrink-0` |
| 5 | Error messages could overflow their flex row (long unbroken token, no min-width reset) | `JsonFormatter`, `Base64EncoderDecoder`, `UrlEncoderDecoder`, `ColorConverter` | Error `<span>`s now `min-w-0 break-words` |
| 6 | "Exclude ambiguous (I, l, 1, O, 0)" toggle was cramped in the 2-column mobile grid | `PasswordGenerator.tsx` | That label now spans 2 columns on mobile (`col-span-2 sm:col-span-1`) |
| 7 | Copy buttons could shrink in flex rows next to long wrapping output | `CopyButton.tsx`, `PasswordGenerator`, `UuidGenerator`, `ColorConverter` | `CopyButton` accepts an optional `className`; callers pass `shrink-0` |
| 8 | Sliders/checkboxes used hard-coded `accent-indigo-600` (not theme-token) and native range inputs had a small touch target | `globals.css`, Password/QR/Color/Json/URL tools | All `accent-indigo-600` → `accent-brand`; global base rule gives `input[type="range"]` a 1.75rem touch height and `accent-color: var(--brand)` (checkboxes too) |
| 9 | Small buttons were 32px tall (below comfortable touch size) | `Button.tsx` | `sm` size raised to `h-9` (36px) |
| 10 | No visible keyboard-focus style on some links/buttons (mobile menu button, footer links) | `globals.css` | Global `:focus-visible` rule — 2px `var(--ring)` outline, 2px offset — covers every focusable element, including ones without their own focus classes |
| 11 | No guard against a stray wide element causing horizontal scroll on small screens | `globals.css` | `body { overflow-x: clip; }` (clip, unlike hidden, does not break the sticky header) |
| 12 | `py-16` top/bottom padding was oversized on mobile | Tool, category, All-Tools pages | `py-10 sm:py-16` / `pt-10 sm:pt-16` |
| 13 | Category section header (`h2` + "View all →") could crowd on narrow screens | `ToolExplorer.tsx` | Header row now `flex-wrap` |
| 14 | A very long "longest word" could overflow its paragraph | `WordCounter.tsx` | Paragraph `break-words`, word `break-all` |
| 15 | Color swatch had `aria-label` on a plain `<div>` (no role) | `ColorConverter.tsx` | Added `role="img"` |

## Branded 404 page (new)

- `src/app/not-found.tsx` — "404 — Page not found / This page doesn't exist", with three full-width-on-mobile buttons: **Go home** (`/`), **All tools** (`/tools`), **Categories** (`/categories`). Metadata includes `robots: { index: false }`.
- Verified in the smoke test: `/tools/nope` and `/categories/nope` serve this branded content (HTTP 200 with a `noindex` meta tag — the documented Next 16 / Partial Prerendering behaviour for a mid-stream `notFound()`, noted in Stage 2); a genuinely unknown route (`/definitely-not-a-page`) returns a true HTTP 404 with the same branded page.

## Responsive audit (code review, all page types)

- **Home `/`**: hero `text-4xl → sm:text-5xl lg:text-6xl`, search `max-w-2xl` with icon/clear affordances, tool grid `1 col → sm:2 → lg:3`, highlights `sm:grid-cols-3`, footer stacks to 1 column on mobile. No overflow found.
- **`/tools`, `/categories`, `/categories/[slug]`**: grids `1 → sm:2 → lg:3` cols; breadcrumbs `flex-wrap`; category cards stack on mobile.
- **`/tools/[slug]`**: header icon + text stack safely, "More tools" grid `1 → sm:3` cols.
- **Tool UIs**: textareas/outputs are `w-full` with `break-all`/`break-words` + `overflow-auto` where needed (JSON `pre-wrap break-words`, Base64/URL `break-all`); sliders full-width with larger touch height; toggle/checkox pills are full-tap targets via their `<label>`.
- **Header**: logo + theme toggle + hamburger fit at 360px; nav hidden below `md`, mobile menu closes on link tap.
- **Dark/light**: no hard-coded light-only colors remain outside the token system (error boxes already had `dark:` variants; QR image intentionally stays on a white background so the code scans). Muted-foreground contrast: ~4.8:1 light, ~7:1 dark.

## Interactions — verified by code + built HTML (not click-tested)

- `/` search shortcut + `Esc` clear in `ToolExplorer.tsx` (listener on `window`, ignores typing except for Esc-in-field, focuses via `inputRef`); `/` hint badge in `SearchBar`; theme toggle calls `setTheme` via next-themes; mobile menu toggles `menuOpen` state and closes on navigation; Copy buttons use clipboard API with textarea fallback.
- Viewport meta verified in built HTML: `<meta name="viewport" content="width=device-width, initial-scale=1"/>` (Next.js default).
- No-flash theme script verified in built HTML: the next-themes inline blocking script is present on `/`, and `ThemeProvider` uses `attribute="class"`, `defaultTheme="system"`, `enableSystem` (persisted via localStorage by next-themes).

## Verification (exact results)

| Check | Command | Result |
|---|---|---|
| Production build | `npm run build` | ✅ **Passed** — compiled in ~16s, TypeScript clean, 22 static pages |
| Lint | `npm run lint` | ✅ **Passed** — exit 0, no errors/warnings |
| Smoke test (production server) | `npx next start -p 3105` + curl | ✅ **12 routes → 200**: `/`, `/tools`, `/categories`, `/categories/text-tools`, `/categories/generators`, `/tools/word-counter`, `/tools/password-generator`, `/tools/qr-code-generator`, `/tools/color-converter`, `/tools/nope` (branded 404 + noindex), `/categories/nope` (branded 404 + noindex); unknown route → true 404 with branded page |
| Built CSS check | grep `.next/static/chunks/*.css` | ✅ Contains `max-w-full`, `break-all`, `text-brand-text`, `accent-brand` — the new utilities are actually generated |
| Server cleanup | kill by exact PID | ✅ Wrapper PID killed, then the surviving `next-server` child PID (6670) killed; port 3105 closed, no `next-server` processes left |

## Explicitly NOT tested — needs a real browser (after deploy, or a browser task)

- **No click/keyboard testing was done** (no live browser in this environment): theme toggle click + persistence across reload, `/` + `Esc` keys, mobile menu open/close on a real phone width, Copy buttons actually writing to the clipboard, QR download, dragging sliders on touch.
- **No visual rendering at 360 / 768 / 1280px** (no screenshots or device emulation): the audit above is code + class reasoning, so a real-browser visual pass could still surface spacing issues, especially dark-mode QR/color pages and the password strength bar.
- Contrast ratios above are computed from the token hex values, not measured from rendered pixels.

## Files changed

| File | Change |
|---|---|
| `src/app/globals.css` | `--brand-text` token (light/dark) + `--color-brand-text`; global `:focus-visible` ring; `body { overflow-x: clip }`; range/checkbox touch + accent rules |
| `src/app/not-found.tsx` | **New** branded 404 page |
| `src/components/ui/Button.tsx` | `sm` size `h-8` → `h-9` |
| `src/components/ui/CopyButton.tsx` | Optional `className` prop |
| `src/components/ToolExplorer.tsx` | Category header `flex-wrap` |
| `src/components/tools/UuidGenerator.tsx` | Stacked mobile layout, `break-all` UUIDs, `shrink-0` copy |
| `src/components/tools/PasswordGenerator.tsx` | `shrink-0` copy, exclude-ambiguous spans 2 cols on mobile |
| `src/components/tools/QrCodeGenerator.tsx` | QR image `max-w-full h-auto` |
| `src/components/tools/ColorConverter.tsx` | Wrapping format rows, `role="img"` swatch, error span `min-w-0 break-words` |
| `src/components/tools/WordCounter.tsx` | Longest-word `break-all` |
| `src/components/tools/JsonFormatter.tsx`, `Base64EncoderDecoder.tsx`, `UrlEncoderDecoder.tsx` | Error spans `min-w-0 break-words` |
| `src/app/page.tsx`, `src/app/tools/[slug]/page.tsx`, `src/app/tools/page.tsx`, `src/app/categories/page.tsx`, `src/app/categories/[slug]/page.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/ToolCard.tsx` | `text-brand` → `text-brand-text`; mobile padding `py-10 sm:py-16` |
| `src/components/tools/*.tsx` (Password, QR, Color, Json, URL) | `accent-indigo-600` → `accent-brand` |

## Next step

Stage 6: Testing, performance and SEO (unit tests for `src/lib/utils`, sitemap/robots, per-tool metadata polish). Stage 7: GitHub + Vercel.
