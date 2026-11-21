# Tools Empire — Week 1 Launch Pack (prepared 2026-11-21)

Status: PREPARED ONLY — nothing submitted, nothing paid, nothing pushed.
Purpose: after Ali approves the Stage 8 push and the deploy is verified live
(icon 200, og:image present), every Week 1 step below can be done by
copy-paste with no new research. Follows STAGE8-REPORT.md §6 Week 1, with
eligibility corrections found 2026-11-21 (see §3 — two directories in the
Stage 8 list would likely reject or charge this site as-is).

Rules honoured: $0 only (no paid reviews, fast-tracks, featured listings or
domain purchases); no spam; value first, link second; honest attribution
("Owned and shipped by Ali Muhammad, developed with Muse").

Fresh verification 2026-11-21 ~02:29 UTC (07:29 PKT):
- `npm test` 75/75 pass (Vitest 3.2.7, 5 files), `npm run lint` clean.
- Live homepage https://tools-empire.vercel.app loads, title
  "Tools Empire — Free Online Tools", "10 free tools — no sign-up required".
- Local HEAD is 02d3c1b on top of 0db2fd6 (push manifest corrected
  2026-11-21: workspace/goals/tools-empire/hidden_files/PUSH-MANIFEST-2026-11-20.md).
- Icon/OG live status last verified 2026-11-20 ~14:29 UTC (/icon.svg 404,
  og:image empty). Re-check at delivery before claiming the fix live.

---

## 1. Correct order (do not reorder)

1. Ali approves Stage 8 push package (manifest above) → push → Vercel redeploy.
2. Verify live: `/`, `/icon.svg` (expect 200), `/tools/word-counter`,
   `/sitemap.xml`, `/robots.txt` all 200; og:image meta present on homepage
   + one tool page. Report actual status codes; do not claim live until seen.
3. Google Search Console (§4) — needs Ali's Google account + code.
4. LinkedIn launch post (separate approval of exact text in
   workspace/goals/linkedin-posts-for-bs-ai-student-brand/files/LinkedIn-ToolsEmpire-Launch-Draft-2026-11-20.md)
   — after step 2 so the link preview shows the OG share image.
5. Directory submissions (§3) — after step 2 so scrapers see the OG image
   and working icon. Use real screenshots (§5), never fake interfaces.

## 2. Copy-paste blocks (use verbatim; counts script-checked 2026-11-21)

- **Name:** Tools Empire
- **Tagline (43 chars):** 10 free browser tools — private, no sign-up
- **Alt tagline (51 chars):** Free online tools that run entirely in your browser
- **Short description (one sentence):**
  Tools Empire is a free all-in-one online tools platform with 10 browser-based tools — word counter, JSON formatter, password generator, QR code generator and more — that run entirely in your browser with no sign-up and nothing uploaded.
- **Long description:**
  Tools Empire is a live, free all-in-one online tools platform with 10 browser-based tools for writers, developers and designers: Word Counter, Character Counter, Case Converter, JSON Formatter, Base64 Encoder/Decoder, URL Encoder/Decoder, UUID Generator, Password Generator, QR Code Generator and Color Converter. Everything runs client-side: no sign-up, no limits, and nothing you type or generate is uploaded. It includes instant search, category browsing, dark/light themes and copy-to-clipboard on generated output. Built with Next.js, React, TypeScript and Tailwind CSS, with 75 automated tests. Owned and shipped by Ali Muhammad, developed with Muse.
  (For AlternativeTo, remove links/emails from the description text per its
  rules; put URLs only in the URL fields.)
- **Website:** https://tools-empire.vercel.app
- **GitHub:** https://github.com/ali-muhammad7/tools-empire
- **Pricing:** Free
- **Platform:** Web
- **Categories (pick closest on each form):** Online Tools / Web Tools /
  Productivity / Developer Tools / Text Tools / Utilities
- **Tags:** word counter, json formatter, password generator, qr code generator, base64, color converter, uuid generator, free online tools
- **Maker:** Ali Muhammad — BS Artificial Intelligence student, Hyderabad, Pakistan. (Do not claim users, traffic or revenue; none is verified.)

## 3. Directory verdicts (checked 2026-11-21; re-check live before submitting)

Stage 8 listed: AlternativeTo, SaaSHub, Uneed, DevHunt, BetaList, 1000.tools, MicroLaunch.
Two corrections matter:

- **SaaSHub — SKIP for now.** Multiple Oct–Nov 2026 guides quoting SaaSHub's
  own rules say products on free subdomains (e.g. `my-app.vercel.app`) are
  not accepted; a product must be on its own domain. Tools Empire is on
  `tools-empire.vercel.app` and Ali's rule is no domain purchases, so a
  submission would likely be rejected. Revisit only if a custom domain is
  ever approved. Sources: https://saascity.io/directories/saashub ,
  https://staging.indiemakershub.com/submit-to/saashub/ ,
  https://another.directory/where-to-launch/saashub
- **BetaList — CHECK PRICE FIRST, skip if paid.** A 16 Oct 2026 directory
  check lists BetaList as paid-only (price shown at end of form). Do not
  pay. Only submit if a genuine $0 route is shown on the live form.
  Source: https://citegaps.com/best-directories-to-submit-saas
- **Uneed — SUBMIT (free line, early).** Free submission assigns a launch
  date 30 days to 5 months out; free launches need an upvote score of 10
  to stay published and 20 for a dofollow link. Form needs: name, URL,
  category, pricing, up to 3 tags, tagline 10–80 chars (use 43-char tagline
  above), rich description, logo + 1–2 screenshots, socials. Account is
  created after the initial URL scrape. Do NOT buy Fast-track ($14.99) or
  Skip the line ($29.99). Submit early precisely because the free line is
  slow. Sources: https://submitator.com/submit-to-uneed ,
  https://launchbuff.com/blog/how-to-submit-to-uneed
- **AlternativeTo — SUBMIT FREE ONLY, low expectations.** Free via account
  with verified email → "Suggest new application" (platforms, license,
  descriptions, tags, URL fields; no links/UTMs in description). Free queue
  is described as months long with no date/position given; $5 priority
  review exists — do not pay. Risk: one Oct 2026 guide lists "simple web
  tools" as not accepted, so position honestly as an all-in-one platform
  of 10 tools (not a single-purpose tool) and accept a possible decline.
  After approval, add Tools Empire as an alternative on relevant tool
  pages (that shelf is where its traffic comes from). Sources:
  https://saascity.io/directories/alternativeto ,
  https://submitator.com/submit-to-alternativeto
- **DevHunt, 1000.tools, MicroLaunch — UNVERIFIED in this run.** No
  eligibility/pricing check was done for these three on 2026-11-21. Before
  submitting, open each live Submit page and confirm: (a) free route
  exists, (b) `vercel.app` subdomain accepted, (c) required fields.
  Submit only if all three pass; otherwise skip and note why. Do not pay.

## 4. Google Search Console — exact steps (needs Ali, ~10 min)

From STAGE8-REPORT.md §3, with the code location verified 2026-11-21:
`src/app/layout.tsx` exports `metadata` with no `verification` field yet.
At implementation time, read the Next.js 16 metadata docs in
`node_modules/next/dist/docs/` first (per tools-empire/AGENTS.md), then add
the Google code as `verification: { google: "XXXX" }` inside that metadata
object. Do not guess the API shape from memory.

1. https://search.google.com/search-console → Add property → **URL prefix**
   → `https://tools-empire.vercel.app` (DNS verification is impossible on a
   vercel.app subdomain).
2. Choose **HTML tag** verification → send Muse the `XXXX` code → Muse adds
   it (above), it deploys, then click **Verify**. Alternative: HTML file
   method — send Muse the `googleXXXX.html` file to place in `public/`.
3. **Sitemaps** → enter `sitemap.xml` → Submit (expect Success, 17 URLs).
4. **URL Inspection** → Request Indexing for homepage + word-counter,
   qr-code-generator, password-generator (daily limit applies).
5. Optional: Bing Webmaster Tools → Import from Google Search Console.
6. Indexing is NOT claimed until Google's Pages report shows indexed pages
   (check in 3–7 days).

## 5. Screenshots to capture at delivery (real site only)

After step 2 verification, capture: homepage desktop, homepage mobile
(360–390px), Word Counter with sample text, QR Code Generator with a
generated QR, Password Generator. Use `src/app/icon.svg` (after push) as
the logo where a logo upload is required. No generated/fake interfaces.

## 6. What this pack does NOT authorise

No push, deploy, submission, account creation, payment or post is authorised
by this file. Each needs Ali's explicit approval for that specific step:
Stage 8 push (manifest), GSC code handling, LinkedIn launch text, and each
directory submission (accounts are Ali's). Analytics (Umami) remains
recommendation-only, not installed.
