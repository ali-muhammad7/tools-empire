import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current page (rendered as plain text). */
  href?: string;
}

/**
 * Breadcrumbs (server component): Home / Category / Tool.
 * The current page is plain text with aria-current="page".
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/"
            className="transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-1.5"
          >
            <ChevronRight
              className="h-4 w-4 text-muted-foreground/60"
              aria-hidden="true"
            />
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
