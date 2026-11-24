import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  categorySlug,
  getToolsByCategory,
} from "@/lib/tools";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse all Tools Empire categories — text, data, generators, design, PDF and image tools. Every tool is free, private and runs entirely in your browser.",
  alternates: { canonical: `${SITE_URL}/categories` },
  openGraph: { url: `${SITE_URL}/categories`, type: "website" },
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <Breadcrumbs items={[{ label: "Categories" }]} />

      <div className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tool categories
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-7 text-muted-foreground">
          Six categories of free tools — every one runs entirely in your
          browser, with no sign-up and no data leaving your device.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {CATEGORIES.map((category, index) => {
          const tools = getToolsByCategory(category);
          return (
            <Reveal key={category} delay={(index % 2) * 0.08}>
            <Link
              href={`/categories/${categorySlug(category)}`}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]"
            >
              <h2 className="text-xl font-semibold tracking-tight">
                {category}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {CATEGORY_DESCRIPTIONS[category]}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {tools.length} {tools.length === 1 ? "tool" : "tools"}:{" "}
                {tools.map((tool) => tool.name).join(", ")}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-text">
                Browse {category}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
