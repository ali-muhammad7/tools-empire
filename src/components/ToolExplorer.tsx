"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchBar } from "./SearchBar";
import { ToolCard } from "./layout/ToolCard";
import {
  CATEGORIES,
  categoryAnchorId,
  categorySlug,
  getToolsByCategory,
  searchTools,
} from "@/lib/tools";

/**
 * Homepage tool browser (client component): live search over the registry
 * plus category sections. With no query, tools are grouped by category;
 * with a query, a flat filtered grid replaces the sections.
 */
export function ToolExplorer() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut: "/" focuses the search (unless already typing in a
  // field), "Escape" clears it. The listener is registered once; all state
  // updates happen inside the event handler, not in the effect body.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target !== null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (event.key === "Escape" && typing) {
        setQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => searchTools(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8">
        <SearchBar value={query} onChange={setQuery} inputRef={inputRef} />
      </div>

      {searching ? (
        <section
          id="all-tools"
          aria-label="Search results"
          className="mx-auto mt-14 max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
        >
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {results.length === 0
              ? `No tools match “${query.trim()}”.`
              : `${results.length} ${results.length === 1 ? "tool" : "tools"} matching “${query.trim()}”`}
          </p>

          {results.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <SearchX
                className="h-10 w-10 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-semibold">
                Nothing found — try another keyword
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Try “password”, “JSON”, “QR code” or “color”. Or clear the
                search to browse all tools by category.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
              >
                Show all tools
              </button>
            </div>
          )}
        </section>
      ) : (
        <div id="categories" className="scroll-mt-24">
          {CATEGORIES.map((category) => {
            const tools = getToolsByCategory(category);
            if (tools.length === 0) return null;
            return (
              <section
                key={category}
                id={categoryAnchorId(category)}
                aria-label={`${category} tools`}
                className="mx-auto mt-16 max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
              >
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {category}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tools.length}{" "}
                      {tools.length === 1 ? "tool" : "tools"} — free, no
                      sign-up, runs in your browser.
                    </p>
                  </div>
                  <Link
                    href={`/categories/${categorySlug(category)}`}
                    className="shrink-0 text-sm font-medium text-brand-text transition-colors hover:underline"
                  >
                    View all →
                  </Link>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}

          <section
            id="all-tools"
            aria-label="All tools"
            className="mx-auto mt-16 max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
          >
            <p className="text-center text-sm text-muted-foreground">
              {`That's all ${CATEGORIES.length} categories — more tools are on the way.`}
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
