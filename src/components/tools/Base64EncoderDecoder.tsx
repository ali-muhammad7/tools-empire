"use client";

import { useState } from "react";
import { ArrowLeftRight, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { base64Decode, base64Encode } from "@/lib/utils/encoding";

const EXAMPLE_TEXT = "Hello, Tools Empire! 👋";

export function Base64EncoderDecoder() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);

  let output = "";
  if (input !== "" && !error) {
    try {
      output = mode === "encode" ? base64Encode(input) : base64Decode(input);
    } catch {
      output = "";
    }
  }

  function handleChange(value: string) {
    setInput(value);
    setError(null);
    if (value === "") return;
    if (mode === "decode") {
      try {
        base64Decode(value);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid Base64.");
      }
    }
  }

  function swap() {
    // Move the current output back into the input and flip direction.
    if (output) setInput(output);
    setError(null);
    setMode(mode === "encode" ? "decode" : "encode");
  }

  return (
    <ToolLayout>
      <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Direction">
        <Button
          type="button"
          variant={mode === "encode" ? "primary" : "secondary"}
          size="sm"
          onClick={() => {
            setMode("encode");
            setError(null);
          }}
        >
          Encode
        </Button>
        <Button
          type="button"
          variant={mode === "decode" ? "primary" : "secondary"}
          size="sm"
          onClick={() => {
            setMode("decode");
            setError(null);
          }}
        >
          Decode
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={swap}>
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" /> Swap
        </Button>
      </div>

      <label
        htmlFor="base64-input"
        className="mb-2 block text-sm font-medium"
      >
        {mode === "encode" ? "Text to encode" : "Base64 to decode"}
      </label>
      <textarea
        id="base64-input"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={
          mode === "encode"
            ? "Type text here…"
            : "Paste Base64 here, e.g. SGVsbG8sIFdvcmxkIQ=="
        }
        rows={6}
        spellCheck={false}
        className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setMode("encode");
            setError(null);
            setInput(EXAMPLE_TEXT);
          }}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Example
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setInput("");
            setError(null);
          }}
          disabled={!input}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Output</span>
          <CopyButton text={output} label="Copy output" />
        </div>
        <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm leading-6 whitespace-pre-wrap break-all">
          {output || "—"}
        </pre>
      </div>
    </ToolLayout>
  );
}
