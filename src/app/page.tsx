import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Lock, Sparkles, Zap } from "lucide-react";
import { HeroBackground } from "@/components/HeroBackground";
import { ShowcaseVideo } from "@/components/ShowcaseVideo";
import { Reveal } from "@/components/Reveal";
import { ToolExplorer } from "@/components/ToolExplorer";
import { SITE_URL, websiteJsonLd } from "@/lib/seo";
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
      {/* Structured data: honest, no ratings or reviews. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            websiteJsonLd(
              TOOLS.map((t) => ({
                slug: t.slug,
                name: t.name,
                description: t.description,
              })),
            ),
          ),
        }}
      />
      {/* Hero: ambient glass loop behind a translucent glass panel */}
      <section className="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-sm">
          <HeroBackground />
          {/* Slight dark tint keeps the deep-indigo loop rich in both themes */}
          <div
            className="absolute inset-0 bg-slate-950/20 dark:bg-background/40"
            aria-hidden="true"
          />
          <div className="relative px-4 py-14 text-center sm:px-10 sm:py-20">
            <div className="mx-auto max-w-3xl rounded-3xl border border-white/50 bg-card/60 px-6 py-10 shadow-lg backdrop-blur-xl dark:border-white/10 sm:px-10">
              <p
                className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
                style={{ "--enter-delay": "0s" } as CSSProperties}
              >
                <Sparkles className="h-3.5 w-3.5 text-brand-text" aria-hidden="true" />
                {TOOLS.length} free tools — no sign-up required
              </p>
              <h1
                className="animate-fade-up mx-auto mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                style={{ "--enter-delay": "0.1s" } as CSSProperties}
              >
                Every tool you need,{" "}
                <span className="text-brand-text">in one place.</span>
              </h1>
              <p
                className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground"
                style={{ "--enter-delay": "0.2s" } as CSSProperties}
              >
                Tools Empire is a premium collection of fast, free online tools for
                writers, developers and designers — from counting words to generating
                QR codes, all running entirely in your browser.
              </p>
            </div>

            {/* Cinematic showcase (Video 1 — click-to-play, zero bytes until clicked) */}
            <figure
              className="animate-fade-up mx-auto mt-10 max-w-3xl"
              style={{ "--enter-delay": "0.3s" } as CSSProperties}
            >
              <ShowcaseVideo />
              <figcaption className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Tools for problems that matter.
              </figcaption>
            </figure>
          </div>
        </div>
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
          {HIGHLIGHTS.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-semibold">{item.title}</h2>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
