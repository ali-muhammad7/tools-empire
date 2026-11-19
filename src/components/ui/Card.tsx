import type { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
}

/** Surface card using the theme's card/background tokens. */
export function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card text-card-foreground shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
