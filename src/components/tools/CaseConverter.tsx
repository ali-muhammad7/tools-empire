"use client";

import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { convertCase, type CaseStyle } from "@/lib/utils/text";

const CASES: { style: CaseStyle; label: string; hint: string }[] = [
  { style: "upper", label: "UPPER CASE", hint: "HELLO WORLD" },
  { style: "lower", label: "lower case", hint: "hello world" },
  { style: "title", label: "Title Case", hint: "Hello World" },
  { style: "sentence", label: "Sentence case", hint: "Hello world." },
  { style: "camel", label: "camelCase", hint: "helloWorld" },
  { style: "snake", label: "snake_case", hint: "hello_world" },
  { style: "kebab", label: "kebab-case", hint: "hello-world" },
];

const EXAMPLE = "the quick brown fox jumps over the lazy dog";

export function CaseConverter() {
  const [text, setText] = useState("");

  return (
    <ToolLayout>
      <label
        htmlFor="case-converter-input"
        className="mb-2 block text-sm font-medium"
      >
        Your text
      </label>
      <textarea
        id="case-converter-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here…"
        rows={6}
        className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setText(EXAMPLE)}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Example
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setText("")}
          disabled={!text}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {CASES.map(({ style, label, hint }) => {
          const converted = convertCase(text, style);
          return (
            <div
              key={style}
              className="flex flex-col gap-2 rounded-xl bg-muted p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {label} <span className="font-normal">· e.g. {hint}</span>
                </p>
                <p className="mt-1 break-words text-sm">
                  {converted || "—"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setText(converted)}
                  disabled={!text}
                >
                  Apply
                </Button>
                <CopyButton text={converted} label="Copy" />
              </div>
            </div>
          );
        })}
      </div>
    </ToolLayout>
  );
}
