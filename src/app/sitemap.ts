import type { MetadataRoute } from "next";
import { CATEGORIES, TOOLS, categorySlug } from "@/lib/tools";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap — generated from the Tool Registry (single source of truth).
 * Home, /tools and /categories plus every category page and every tool
 * page: 1 + 1 + 1 + 4 + 10 = 17 URLs. Add a tool to the registry and it
 * appears here automatically.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...CATEGORIES.map((category) => ({
      url: `${SITE_URL}/categories/${categorySlug(category)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...TOOLS.map((tool) => ({
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
