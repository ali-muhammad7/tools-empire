import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface ToolLayoutProps {
  children: ReactNode;
}

/** Shared content wrapper for tool pages: a card + a privacy note. */
export function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">{children}</Card>
      <p className="text-center text-xs text-muted-foreground">
        Runs entirely in your browser — nothing you type or paste leaves your
        device.
      </p>
    </div>
  );
}
