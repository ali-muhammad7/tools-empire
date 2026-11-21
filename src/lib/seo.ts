/**
 * Tools Empire — SEO constants.
 *
 * SITE_URL is the canonical base URL used for sitemaps, canonical links,
 * Open Graph URLs and JSON-LD. Live since Stage 7 at
 * https://tools-empire.vercel.app. If a custom domain is added later,
 * update this ONE value and every canonical URL, sitemap entry and
 * structured-data URL updates with it.
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
/**
 * Honest structured data for the homepage: just the site itself and the
 * real tool list — no ratings, reviews or invented claims.
 */
export function websiteJsonLd(tools: ToolJsonLdInput[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tools Empire",
    url: SITE_URL,
    description:
      "A premium collection of free online tools. Fast, private, and running entirely in your browser.",
    hasPart: tools.map((tool) => ({
      "@type": "SoftwareApplication",
      name: tool.name,
      url: `${SITE_URL}/tools/${tool.slug}`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
    })),
  };
}

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
