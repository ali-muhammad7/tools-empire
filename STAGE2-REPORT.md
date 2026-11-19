# Tools Empire — Stage 2 Report: Homepage & Design System

**Date:** 2026-11-17
**Status:** ✅ Complete — homepage, design system, theme toggle and tool-page shells done. Production build and lint both pass; smoke-tested against the built site.
**Scope:** Stage 2 only. **No tool is functional yet** — the 10 tool pages are honest "coming in Stage 3" placeholders. Nothing published, deployed, pushed to GitHub, or purchased. No git repo initialised (Stage 7).

## Dependencies added (free, open-source only)

| Package | Version installed | Purpose |
|---|---|---|
| `lucide-react` | `^1.73.0` | Icons (tool cards, header, theme toggle) |
| `next-themes` | `^0.4.6` | Dark/light mode, class strategy, no-flash script |

Installed with `npm install lucide-react next-themes`. No other dependencies added. Stack unchanged otherwise: next 16.4.6, react 19.3.0, tailwindcss 4.3.3, typescript 5.9.3.

## Files created

| File | What it is |
|---|---|
| `src/lib/tools.ts` | **Tool Registry — single source of truth.** All 10 tools (slug, name, description, category, keywords, lucide icon name), `CATEGORIES` list, `getToolBySlug`, `getToolsByCategory`, `searchTools` (multi-word, case-insensitive), `categoryAnchorId`. |
| `src/lib/tool-icons.tsx` | Name → rendered lucide icon (`ToolIcon` component, switch-based). All icon names verified against installed lucide-react 1.73: `Fingerprint` does **not** exist in this version, so UUID Generator uses `Scan`. |
| `src/app/globals.css` | Design system. Tailwind v4 CSS-first: `@theme inline` tokens (brand indigo, background/foreground/card/muted/border), system/Inter font stack (no paid fonts, no webfont download), light + dark CSS variables, `@custom-variant dark` for class-based dark mode, smooth theme transitions. **No `tailwind.config.js`** (v4 has none). |
| `src/components/ThemeProvider.tsx` | Client wrapper around next-themes: `attribute="class"`, `defaultTheme="system"`, `enableSystem`. Injects the blocking script that applies the stored theme before paint (no flash). |
| `src/components/layout/ThemeToggle.tsx` | Sun/Moon toggle. Both icons render; CSS `dark:` variant picks the visible one — no mounted-state dance, no hydration mismatch. |
| `src/components/layout/Header.tsx` | Sticky header: Tools Empire logo, nav (Home / Categories / All Tools), theme toggle, mobile hamburger menu. |
| `src/components/layout/Footer.tsx` | Category + all-tools link columns, privacy note ("No sign-up. No data leaves your device."), copyright with client-rendered year. |
| `src/components/layout/ToolCard.tsx` | Tool card: icon tile, category badge, name, description, "Open tool →" link to `/tools/[slug]`, hover lift. |
| `src/components/SearchBar.tsx` | Controlled search input with icon + clear button. |
| `src/components/ToolExplorer.tsx` | Client component: live search over the registry (filters as you type, result count, empty state with "Show all tools"); with no query, tools grouped into the 4 category sections. |
| `src/components/CurrentYear.tsx` | Footer year, read after mount (see "Next.js 16 gotchas"). |
| `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx` | Shared primitives (variants/sizes; theme-token card). |
| `src/app/tools/[slug]/page.tsx` | Tool-page shell: `generateStaticParams` from the registry, per-tool `generateMetadata`, `notFound()` for unknown slugs, and an explicit **"This tool is coming in Stage 3"** state with links to other tools. Does not fake a working tool. |

## Files changed

| File | Change |
|---|---|
| `src/app/layout.tsx` | Removed Geist font imports (system stack now), added SEO metadata (title template, description, keywords, Open Graph, Twitter), `suppressHydrationWarning` on `<html>`, wrapped in `ThemeProvider` + `Header`/`Footer`. |
| `src/app/page.tsx` | Replaced starter page: hero (headline, subcopy, "10 free tools" badge), `ToolExplorer` (search + category sections), "Why Tools Empire" highlights (Instant / Private / Free). |
| `package.json` / `package-lock.json` | Two new dependencies (above). |

## Tool registry contents

| Tool | Slug | Category | Icon |
|---|---|---|---|
| Word Counter | `word-counter` | Text Tools | FileText |
| Character Counter | `character-counter` | Text Tools | Hash |
| Case Converter | `case-converter` | Text Tools | CaseUpper |
| JSON Formatter | `json-formatter` | Encoding & Data | Braces |
| Base64 Encoder/Decoder | `base64-encoder-decoder` | Encoding & Data | Binary |
| URL Encoder/Decoder | `url-encoder-decoder` | Encoding & Data | Link2 |
| UUID Generator | `uuid-generator` | Generators | Scan |
| Password Generator | `password-generator` | Generators | KeyRound |
| QR Code Generator | `qr-code-generator` | Generators | QrCode |
| Color Converter | `color-converter` | Design Tools | Palette |

## Verification (exact results)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ **Passed** — exit 0, no errors/warnings |
| Production build | `npm run build` | ✅ **Passed** — compiled in ~4s, TypeScript clean, 15 static pages generated. Routes: `/`, `/_not-found`, `/tools/[slug]` × 10 |
| Smoke test (production server) | `npx next start` + curl | ✅ `/` → 200, all 10 tool names + all 4 categories + hero headline present in HTML; `/tools/word-counter` and `/tools/qr-code-generator` → 200; tool page contains "coming in Stage 3" text; next-themes no-flash script present in HTML |

No dev/production server left running.

## Next.js 16 gotchas hit and fixed (all verified in the passing build)

1. **`new Date()` is rejected during prerendering** under Cache Components — first in the server Footer, then even in a client component's render. Fix: `CurrentYear` reads the year in a `requestAnimationFrame` callback inside `useEffect` (initial value 2026, corrected on mount).
2. **`react-hooks/static-components` (new in eslint-config-next 16):** assigning a component from a lookup during render (`const Icon = getToolIcon(...)`) is a lint error. Fix: `ToolIcon` component with a switch that references module-level lucide components directly. (This also forced `tool-icons.ts` → `tool-icons.tsx`, since it now contains JSX.)
3. **`react-hooks/set-state-in-effect`:** `setMounted(true)` / `setYear(...)` directly in an effect body is a lint error. Fix: ThemeToggle avoids state entirely (CSS `dark:` icon swap); CurrentYear defers the setState into a rAF callback.
4. **`dynamicParams: false` is incompatible with `cacheComponents: true`** — the build fails with that exact error, and the Next 16 migration guide says to delete the export and use `notFound()` instead. Reverted. Consequence (documented Next.js behaviour, confirmed in the smoke test): an unknown slug streams HTTP 200 with the 404 page content plus `<meta name="robots" content="noindex">`, because with Partial Prerendering the shell is sent before `notFound()` fires. Search engines will not index unknown slugs, and only the 10 registry slugs are ever linked. A custom `not-found.tsx` is still open for Stage 5/6 if a branded 404 page is wanted.

## Still placeholder / not done (Stage 3+)

- **All 10 tool pages** (`/tools/[slug]`) show "This tool is coming in Stage 3" — no tool logic exists yet. Nothing on the site claims otherwise.
- No sitemap, robots.txt, or per-tool OG images (Stage 6).
- No tests yet (Stage 6); no git repo / deployment (Stage 7).
- Theme toggle and search were verified in rendered HTML and build output, but not yet click-tested in a real browser — that is a Stage 5 check.
- `Button`/`Card` primitives exist but the homepage uses mostly Tailwind classes directly; they are available for Stage 3 tool UIs.

## Next step

Stage 3: implement all 10 functional tools (pure logic in `src/lib/`, UI in the existing `/tools/[slug]` shell, driven by the registry above).
