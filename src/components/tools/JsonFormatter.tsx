"use client";

import { useState } from "react";
import { RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { formatJson } from "@/lib/utils/encoding";

const EXAMPLE = `{"name":"Tools Empire","tools":["word counter","json formatter"],"free":true,"version":1}`;

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [minify, setMinify] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);

  const result = input.trim() === "" ? null : formatJson(input, { minify, sortKeys });

  return (
    <ToolLayout>
      <label
        htmlFor="json-formatter-input"
        className="mb-2 block text-sm font-medium"
      >
        JSON input
      </label>
      <textarea
        id="json-formatter-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Paste JSON here, e.g. {"name": "Tools Empire"}'
        rows={9}
        spellCheck={false}
        className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setInput(EXAMPLE)}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Example
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear
        </Button>
        <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={minify}
            onChange={(e) => setMinify(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Minify
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Sort keys
        </label>
      </div>

      {result && !result.ok && (
        <div
          role="alert"
          className="mt-5 flex gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">
            <strong>Invalid JSON:</strong> {result.error}
          </span>
        </div>
      )}

      {result && result.ok && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              {minify ? "Minified output" : "Formatted output"}
            </span>
            <CopyButton text={result.output} label="Copy output" />
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm leading-6 whitespace-pre-wrap break-words">
            {result.output}
          </pre>
        </div>
      )}
    </ToolLayout>
  );
}
