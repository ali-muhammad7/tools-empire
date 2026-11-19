import type { Metadata } from "next";
import { Lock, Sparkles, Zap } from "lucide-react";
import { ToolExplorer } from "@/components/ToolExplorer";
import { SITE_URL } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";

/** Homepage canonical (title/description come from the root layout). */
export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: { url: SITE_URL, type: "website" },
};

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Instant results",
    text: "Every tool works the moment you type — no waiting, no page reloads.",
  },
  {
    icon: Lock,
    title: "100% private",
    text: "All processing happens in your browser. Your text never leaves your device.",
  },
  {
    icon: Sparkles,
    title: "Free forever",
    text: "All tools are free with no sign-up, no limits and no watermarks.",
  },
];

export default function Home() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-brand-text" aria-hidden="true" />
          {TOOLS.length} free tools — no sign-up required
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Every tool you need,{" "}
          <span className="text-brand-text">in one place.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Tools Empire is a premium collection of fast, free online tools for
          writers, developers and designers — from counting words to generating
          QR codes, all running entirely in your browser.
        </p>
      </section>

      {/* Search + category sections (live filtering over the registry) */}
      <div className="mt-9">
        <ToolExplorer />
      </div>

      {/* Highlights */}
      <section
        aria-label="Why Tools Empire"
        className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-semibold">{item.title}</h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
