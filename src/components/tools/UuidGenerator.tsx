"use client";

import { useEffect, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { generateUuids } from "@/lib/utils/generators";

const COUNTS = [1, 5, 10] as const;

export function UuidGenerator() {
  const [count, setCount] = useState<number>(5);
  // crypto.randomUUID() is unstable during prerender (Next 16 rejects it),
  // so the first batch is generated after mount, inside a rAF callback —
  // the same deferral pattern as CurrentYear (direct setState in an effect
  // body is a lint error).
  const [uuids, setUuids] = useState<string[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setUuids(generateUuids(5));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function regenerate(n: number = count) {
    setUuids(generateUuids(n));
  }

  return (
    <ToolLayout>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="How many UUIDs">
        <span className="text-sm font-medium">Generate:</span>
        {COUNTS.map((n) => (
          <Button
            key={n}
            type="button"
            variant={count === n ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              setCount(n);
              regenerate(n);
            }}
          >
            {n}
          </Button>
        ))}
        <Button type="button" size="sm" onClick={() => regenerate()}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Regenerate
        </Button>
        <CopyButton
          text={uuids.join("\n")}
          label="Copy all"
        />
      </div>

      <ul className="mt-5 space-y-2">
        {uuids.map((uuid) => (
          <li
            key={uuid}
            className="flex flex-col gap-2 rounded-xl bg-muted px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <code className="min-w-0 font-mono text-sm break-all">{uuid}</code>
            <CopyButton text={uuid} label="Copy" className="shrink-0 self-start sm:self-auto" />
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <Copy className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Version 4 UUIDs, generated with the browser&apos;s cryptographic
        random source (<code className="font-mono">crypto.randomUUID()</code>).
        Format: 8-4-4-4-12 hexadecimal digits.
      </p>
    </ToolLayout>
  );
}
