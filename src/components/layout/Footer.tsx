import { ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { CurrentYear } from "@/components/CurrentYear";
import { CATEGORIES, TOOLS, categorySlug } from "@/lib/tools";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Tools<span className="text-brand-text"> Empire</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              A premium collection of free online tools. Fast, simple, and
              private — every tool runs entirely in your browser.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck
                className="h-4 w-4 text-brand-text"
                aria-hidden="true"
              />
              No sign-up. No data leaves your device.
            </p>
          </div>

          <nav aria-label="Tool categories">
            <h2 className="text-sm font-semibold">Categories</h2>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/categories/${categorySlug(category)}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="All tools">
            <h2 className="text-sm font-semibold">All Tools</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {TOOLS.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © <CurrentYear /> Tools Empire. Free online tools for everyone.
        </div>
      </div>
    </footer>
  );
}
