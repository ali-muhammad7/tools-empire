/**
 * Tools Empire — SEO constants.
 *
 * SITE_URL is the canonical base URL used for sitemaps, canonical links,
 * Open Graph URLs and JSON-LD. There is no live domain yet (deployment is
 * Stage 7): until then this is a placeholder for the expected Vercel
 * address. When the real domain is known, update this ONE value and every
 * canonical URL, sitemap entry and structured-data URL updates with it.
 * Override per-environment with NEXT_PUBLIC_SITE_URL (no trailing slash).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://tools-empire.vercel.app";

export interface ToolJsonLdInput {
  slug: string;
  name: string;
  description: string;
}

/**
 * Honest structured data for a tool page: no ratings, reviews or other
 * claims we cannot back up — just what the tool is and that it is free.
 */
export function toolJsonLd(tool: ToolJsonLdInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/tools/${tool.slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
