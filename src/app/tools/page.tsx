import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ToolExplorer } from "@/components/ToolExplorer";
import { SITE_URL } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "All Tools",
  description:
    "Browse all 10 free Tools Empire tools — word counter, JSON formatter, password generator, QR code generator and more. Free, private, and running entirely in your browser.",
  alternates: { canonical: `${SITE_URL}/tools` },
  openGraph: { url: `${SITE_URL}/tools`, type: "website" },
};

/**
 * All Tools page (Stage 4). Reuses the homepage ToolExplorer — live search
 * plus the full list grouped by category — so the list is never duplicated
 * and always matches the registry.
 */
export default function AllToolsPage() {
  return (
    <div className="pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <Breadcrumbs items={[{ label: "All Tools" }]} />
        <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
          All tools
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-7 text-muted-foreground">
          {TOOLS.length} free tools, grouped by category. Search by name or
          keyword — try “password”, “JSON” or “color”.
        </p>
      </div>

      <div className="mt-9">
        <ToolExplorer />
      </div>
    </div>
  );
}
