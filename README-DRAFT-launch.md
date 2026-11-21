# Tools Empire

A free all-in-one online tools platform with 10 browser-based tools. Everything runs client-side — no sign-up, and nothing you type or generate is uploaded.

**Live site:** https://tools-empire.vercel.app

## Tools

**Text Tools**
- [Word Counter](https://tools-empire.vercel.app/tools/word-counter) — words, characters, sentences, paragraphs, as you type
- [Character Counter](https://tools-empire.vercel.app/tools/character-counter) — characters with/without spaces, lines and bytes
- [Case Converter](https://tools-empire.vercel.app/tools/case-converter) — UPPERCASE, lowercase, Title Case, sentence case and more

**Encoding & Data**
- [JSON Formatter](https://tools-empire.vercel.app/tools/json-formatter) — beautify, minify and validate JSON with clear errors
- [Base64 Encoder/Decoder](https://tools-empire.vercel.app/tools/base64-encoder-decoder) — encode and decode Base64 locally
- [URL Encoder/Decoder](https://tools-empire.vercel.app/tools/url-encoder-decoder) — percent-encode and decode URLs

**Generators**
- [UUID Generator](https://tools-empire.vercel.app/tools/uuid-generator) — random UUID v4 identifiers, single or bulk
- [Password Generator](https://tools-empire.vercel.app/tools/password-generator) — strong random passwords with your length and character sets
- [QR Code Generator](https://tools-empire.vercel.app/tools/qr-code-generator) — turn any URL or text into a downloadable QR code

**Design Tools**
- [Color Converter](https://tools-empire.vercel.app/tools/color-converter) — convert between HEX, RGB and HSL with instant preview

## Features

- Instant search across all tools (`/` to focus, `Esc` to clear)
- Category browsing with breadcrumbs and related tools
- Dark/light themes with saved preference
- Copy-to-clipboard on generated output
- SEO basics: per-tool metadata, sitemap, robots, structured data
- Responsive layout, keyboard-friendly controls

## Stack

- Next.js (App Router), React, TypeScript, Tailwind CSS
- 75 automated tests (Vitest) covering the tool logic
- Deployed on Vercel from this repository's `main` branch

## Run locally

```bash
npm install
npm run dev     # development server at http://localhost:3000
npm test        # run the test suite
npm run lint    # lint
npm run build   # production build
```

## About

Owned and shipped by [Ali Muhammad](https://github.com/ali-muhammad7), developed with Muse.
