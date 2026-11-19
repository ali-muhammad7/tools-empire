import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Home, LayoutGrid, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page doesn't exist on Tools Empire. Browse all free tools or explore the tool categories instead.",
  robots: { index: false },
};

/**
 * Branded 404 page (Stage 5). Shown for unknown routes and for unknown
 * tool/category slugs via notFound(). Links back to Home, All Tools and
 * Categories — never a dead end.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-28">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-text">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-semibold tracking-wide text-brand-text uppercase">
        404 — Page not found
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        This page doesn&apos;t exist
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-7 text-muted-foreground">
        The link may be mistyped, or the page may have moved. All 10 free
        tools are still one click away.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
        >
          <Home className="h-4 w-4" aria-hidden="true" /> Go home
        </Link>
        <Link
          href="/tools"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-muted px-5 text-sm font-medium text-foreground transition-colors hover:bg-border/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
        >
          <Wrench className="h-4 w-4" aria-hidden="true" /> All tools
        </Link>
        <Link
          href="/categories"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-muted px-5 text-sm font-medium text-foreground transition-colors hover:bg-border/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" /> Categories
        </Link>
      </div>
    </div>
  );
}
