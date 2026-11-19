import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ToolIcon } from "@/lib/tool-icons";
import type { Tool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-text transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
          <ToolIcon icon={tool.icon} className="h-6 w-6" />
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {tool.category}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">
        {tool.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
        {tool.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-text">
        Open tool
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
