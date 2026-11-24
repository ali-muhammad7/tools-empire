/**
 * Loading placeholder shown while a lazy tool chunk downloads.
 * Mirrors the ToolLayout card shape so the page does not jump.
 */
export function ToolSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading tool">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton mt-4 h-10 w-48 rounded-lg" />
        <div className="skeleton mt-3 h-4 w-3/4 rounded" />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Loading tool…
      </p>
    </div>
  );
}
