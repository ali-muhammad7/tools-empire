import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  TOOLS,
  categorySlug,
  getCategoryBySlug,
  getToolBySlug,
  getToolsByCategory,
  searchTools,
} from "../tools";

/**
 * Registry sanity — the sitemap, navigation, search and category pages are
 * all generated from this registry, so a broken entry here breaks SEO too.
 */
describe("tool registry", () => {
  it("contains exactly 13 tools", () => {
    expect(TOOLS).toHaveLength(13);
  });

  it("has unique slugs", () => {
    const slugs = TOOLS.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("assigns every tool to a known category", () => {
    for (const tool of TOOLS) {
      expect(CATEGORIES).toContain(tool.category);
    }
  });

  it("has at least one tool per category", () => {
    for (const category of CATEGORIES) {
      expect(getToolsByCategory(category).length).toBeGreaterThan(0);
    }
  });

  it("resolves slugs and categories both ways", () => {
    expect(getToolBySlug("word-counter")?.name).toBe("Word Counter");
    expect(getToolBySlug("nope")).toBeUndefined();
    expect(categorySlug("Encoding & Data")).toBe("encoding-data");
    expect(getCategoryBySlug("generators")).toBe("Generators");
    expect(getCategoryBySlug("nope")).toBeUndefined();
  });

  it("searches by keyword", () => {
    expect(searchTools("json").map((tool) => tool.slug)).toContain(
      "json-formatter",
    );
    expect(searchTools("password")).toHaveLength(1);
    expect(searchTools("")).toHaveLength(13);
  });
});
