import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ToolCard } from "@/components/layout/ToolCard";
import { ToolIcon } from "@/lib/tool-icons";
import { SITE_URL, toolJsonLd } from "@/lib/seo";
import { TOOLS, categorySlug, getToolBySlug } from "@/lib/tools";
import { Base64EncoderDecoder } from "@/components/tools/Base64EncoderDecoder";
import { CaseConverter } from "@/components/tools/CaseConverter";
import { CharacterCounter } from "@/components/tools/CharacterCounter";
import { ColorConverter } from "@/components/tools/ColorConverter";
import { JsonFormatter } from "@/components/tools/JsonFormatter";
import { PasswordGenerator } from "@/components/tools/PasswordGenerator";
import { QrCodeGeneratorLazy } from "@/components/tools/QrCodeGeneratorLazy";
import { UrlEncoderDecoder } from "@/components/tools/UrlEncoderDecoder";
import { UuidGenerator } from "@/components/tools/UuidGenerator";
import { WordCounter } from "@/components/tools/WordCounter";

/**
 * Tool page (Stage 3). The interactive tool is chosen by a switch on the
 * registry slug — each branch references its component directly, never via
 * a lookup assigned during render (the `react-hooks/static-components`
 * lint rule forbids that pattern).
 */
export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

// NOTE: `dynamicParams` is NOT supported with `cacheComponents: true`
// (Next 16 build error). Unlisted slugs are handled by `notFound()` below.
// Under Partial Prerendering that streams as HTTP 200 with the 404 page
// content plus `<meta name="robots" content="noindex">` — the documented
// Next.js behaviour for a mid-stream notFound() — so search engines will
// not index unknown slugs. Only the 10 registry slugs are ever linked.

export async function generateMetadata({
  params,
}: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Tool not found" };
  const url = `${SITE_URL}/tools/${tool.slug}`;
  const description = `${tool.description} Free, private, and running entirely in your browser.`;
  return {
    title: tool.name,
    description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${tool.name} | Tools Empire`,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} | Tools Empire`,
      description,
    },
  };
}

function ToolContent({ slug }: { slug: string }) {
  switch (slug) {
    case "word-counter":
      return <WordCounter />;
    case "character-counter":
      return <CharacterCounter />;
    case "case-converter":
      return <CaseConverter />;
    case "json-formatter":
      return <JsonFormatter />;
    case "base64-encoder-decoder":
      return <Base64EncoderDecoder />;
    case "url-encoder-decoder":
      return <UrlEncoderDecoder />;
    case "uuid-generator":
      return <UuidGenerator />;
    case "password-generator":
      return <PasswordGenerator />;
    case "qr-code-generator":
      return <QrCodeGeneratorLazy />;
    case "color-converter":
      return <ColorConverter />;
    default:
      return null;
  }
}

export default async function ToolPage({
  params,
}: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  // Related tools: same category first, then the rest, up to 3.
  const relatedTools = [
    ...TOOLS.filter((t) => t.slug !== tool.slug && t.category === tool.category),
    ...TOOLS.filter((t) => t.slug !== tool.slug && t.category !== tool.category),
  ].slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      {/* Structured data: honest, no ratings or reviews. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd(tool)) }}
      />
      <Breadcrumbs
        items={[
          { label: "Categories", href: "/categories" },
          {
            label: tool.category,
            href: `/categories/${categorySlug(tool.category)}`,
          },
          { label: tool.name },
        ]}
      />

      <div className="mt-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-text">
          <ToolIcon icon={tool.icon} className="h-7 w-7" />
        </span>
        <div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {tool.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {tool.name}
          </h1>
          <p className="mt-2 max-w-2xl text-lg leading-7 text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <ToolContent slug={tool.slug} />
      </div>

      <section aria-label="More tools" className="mt-14">
        <h2 className="text-lg font-semibold">More tools to explore</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {relatedTools.map((other) => (
            <ToolCard key={other.slug} tool={other} />
          ))}
        </div>
      </section>
    </div>
  );
}
