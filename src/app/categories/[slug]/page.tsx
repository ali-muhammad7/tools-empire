import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ToolCard } from "@/components/layout/ToolCard";
import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  categorySlug,
  getCategoryBySlug,
  getToolsByCategory,
} from "@/lib/tools";
import { SITE_URL } from "@/lib/seo";

/**
 * Category page (Stage 4). One static page per registry category.
 * Unknown slugs call notFound() — see the note in
 * `src/app/tools/[slug]/page.tsx` for the Next 16 / Partial Prerendering
 * behaviour (streams the 404 page with a noindex meta tag).
 */
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: categorySlug(category) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  const url = `${SITE_URL}/categories/${categorySlug(category)}`;
  const description = `${CATEGORY_DESCRIPTIONS[category]} Free, private, and running entirely in your browser.`;
  return {
    title: `${category} — Free Online Tools`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${category} | Tools Empire`,
      description,
      url,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const tools = getToolsByCategory(category);
  const otherCategories = CATEGORIES.filter((c) => c !== category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Categories", href: "/categories" },
          { label: category },
        ]}
      />

      <div className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {category}
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-7 text-muted-foreground">
          {CATEGORY_DESCRIPTIONS[category]}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {tools.length} {tools.length === 1 ? "tool" : "tools"} — free,
          no sign-up, runs in your browser.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      <section aria-label="Other categories" className="mt-16">
        <h2 className="text-lg font-semibold">Other categories</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {otherCategories.map((other) => (
            <li key={other}>
              <Link
                href={`/categories/${categorySlug(other)}`}
                className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:border-brand/50 hover:text-brand-text"
              >
                {other} ({getToolsByCategory(other).length})
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
