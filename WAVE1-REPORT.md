# Wave 1 Report — PDF Organizer, Image Compressor & Converter, JWT Decoder

**Date:** 2026-11-22 · **Status:** Built and tested locally. **NOT pushed, NOT deployed** — awaiting Ali's approval.

## What was built

### 1. PDF Organizer (`/tools/pdf-organizer`, new "PDF Tools" category)
- Merge multiple PDFs, split into one file per page (.zip), extract selected pages, rotate pages (90° steps), reorder by drag-and-drop or arrow buttons, reverse order.
- Page thumbnails rendered with PDF.js (legacy build — see bug note below), select-by-range input ("1-3, 5"), per-file remove, clear all.
- Engine: **pdf-lib 1.17.1** (lossless page operations) + **pdfjs-dist 6.5.438** (previews only). Both lazy-loaded on this page only.
- Guardrails: encrypted/corrupt PDFs get a clear error; >100MB total shows a memory warning; thumbnails capped at 120 pages (all pages still included in downloads).

### 2. Image Compressor & Converter (`/tools/image-compressor`, new "Image Tools" category)
- Batch up to 50 images; JPG/PNG/WebP output (keep-original option); quality slider; **target file size mode** (binary-searches quality to hit e.g. 100KB); resize caps (1920/1280/800px); EXIF orientation honoured; per-file before→after sizes; download individually or all as .zip (JSZip 3.10.2, loaded on demand).
- Engine: native Canvas API — no extra image library. Honest notes built in: PNG ignores quality/target-size; Safari cannot encode WebP (detected and reported, not silently wrong).

### 3. JWT Decoder (`/tools/jwt-decoder`, Encoding & Data)
- Decodes header + payload with per-claim plain-English explanations and human-readable exp/iat/nbf dates; structural findings (expired, not-yet-valid, alg=none, missing alg).
- Prominent **"Decoding is not verifying"** warning, as requested.
- Optional **HS256 signature verification** via WebCrypto (secret never leaves the tab). Verified against a known-good token and wrong-secret/tampered cases.

### Shared / platform changes
- New `FileDropzone` component (drag-drop + keyboard accessible) and download helpers, reused by both file tools.
- Registry: 13 tools, 6 categories. Sitemap now 22 URLs; category pages, search, related-tools and OG images picked the new tools up automatically.
- Existing 10 tools untouched; homepage ships **no** PDF/image library code (verified: 0 pdf chunks in homepage HTML).

## Tests — all passing
- **128/128 unit tests** (75 existing + 53 new: jwt 21, pdf 16, image 16). PDF tests run real pdf-lib operations (merge order, extract, split, rotation) in Node.
- **Lint:** clean (exit 0). **Build:** succeeds, 58 pages.
- **25/25 real-browser functional checks** (Playwright + headless Chromium against the production build): JWT decode/verify/reject cases; image batch compress (598KB→287KB at 80% quality), target-size mode (3.2MB PNG → 84KB JPG at 100KB target); PDF merge of 2 files (5 pages, page 1 rotated 90° verified in the downloaded file), extract 2 pages, split ZIP with 5 files; existing Word Counter + homepage intact.
- **Mobile:** 360px viewport, 0px horizontal overflow on all 3 new pages.

## Bug found and fixed during testing
PDF thumbnails silently failed (`UnknownErrorException: a.toHex is not a function`): pdfjs-dist's modern build assumes `Uint8Array.prototype.toHex`, a very new JS builtin missing in older browsers. Fixed by using pdfjs-dist's **legacy build** (ships polyfills). Thumbnails verified working after the fix. The merge/split engine (pdf-lib) was never affected.

## Known limitations (honest list)
- Password-protected PDFs cannot be opened (pdf-lib limit) — clear error shown.
- Very large PDFs/images are bounded by device memory; warnings shown, low-end phones may struggle above ~100MB.
- Safari cannot save WebP (platform limit) — detected, user told to pick JPG/PNG.
- PNG compression is lossless-only; target-size mode applies to JPG/WebP.
- JWT verification supports HS256 only (RS256/ES256 need public keys — decode still works).
- Not yet tested on a real phone (emulated 360px only), same open item as Stage 8.

## Not done (by design)
- No push to GitHub, no deployment — waiting for Ali's approval.
- Wave 2 (ATS Checker, OCR, JSON↔CSV, SQL Formatter) not started.
