"use client";

import { useState } from "react";
import { ArrowLeftRight, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { urlDecode, urlEncode } from "@/lib/utils/encoding";

const EXAMPLE_URL = "https://example.com/search?q=hello world&lang=en";

export function UrlEncoderDecoder() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [fullUrl, setFullUrl] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let output = "";
  if (input !== "" && !error) {
    try {
      output = mode === "encode" ? urlEncode(input, fullUrl) : urlDecode(input);
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
        urlDecode(value);
      } catch {
        setError(
          "Not valid percent-encoding — check for a stray % or an incomplete %XX sequence.",
        );
      }
    }
  }

  function swap() {
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
        {mode === "encode" && (
          <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={fullUrl}
              onChange={(e) => setFullUrl(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Full URL mode
          </label>
        )}
      </div>

      <label htmlFor="url-input" className="mb-2 block text-sm font-medium">
        {mode === "encode" ? "URL or text to encode" : "Encoded URL to decode"}
      </label>
      <textarea
        id="url-input"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="https://example.com/search?q=hello world"
        rows={5}
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
            setInput(EXAMPLE_URL);
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

      <p className="mt-3 text-xs text-muted-foreground">
        Full URL mode keeps <code className="font-mono">:// ? &amp; = /</code>{" "}
        intact and encodes only spaces and unsafe characters. Component mode
        encodes everything except letters, digits and{" "}
        <code className="font-mono">- _ . ! ~ * &apos; ( )</code> — use it for
        a single query value.
      </p>

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
