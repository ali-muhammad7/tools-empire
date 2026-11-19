"use client";

import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { analyzeText } from "@/lib/utils/text";

const EXAMPLE =
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet, which makes it perfect for testing.\n\nTry pasting your own text here to see live word, character and sentence counts — plus an estimated reading time.";

export function WordCounter() {
  const [text, setText] = useState("");
  const stats = analyzeText(text);
  const reading =
    stats.words === 0
      ? "—"
      : stats.readingTimeMinutes < 1
        ? "Less than a minute"
        : `~${stats.readingTimeMinutes} min`;

  const statItems = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading time", value: reading },
  ];

  return (
    <ToolLayout>
      <label
        htmlFor="word-counter-input"
        className="mb-2 block text-sm font-medium"
      >
        Your text
      </label>
      <textarea
        id="word-counter-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here…"
        rows={10}
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
        <CopyButton text={text} label="Copy text" />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-muted px-4 py-3"
          >
            <dt className="text-xs font-medium text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm break-words text-muted-foreground">
        Longest word:{" "}
        <span className="font-medium break-all text-foreground">
          {stats.longestWord || "—"}
        </span>{" "}
        · Reading time at 200 words per minute.
      </p>
    </ToolLayout>
  );
}
