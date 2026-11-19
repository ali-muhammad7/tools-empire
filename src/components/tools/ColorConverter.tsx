"use client";

import { useState } from "react";
import { RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import {
  convertColor,
  hslToRgb,
  rgbToHex,
  type ColorFormats,
} from "@/lib/utils/color";

const EXAMPLE = "#4f46e5";

export function ColorConverter() {
  const [hexInput, setHexInput] = useState("#4f46e5");
  const [error, setError] = useState<string | null>(null);

  const formats: ColorFormats | null =
    error || hexInput.trim() === "" ? null : convertColor(hexInput);

  function setFromHex(value: string) {
    setHexInput(value);
    setError(null);
    if (value.trim() !== "" && !convertColor(value)) {
      setError(
        "Not a valid HEX color. Use 3 or 6 hex digits, e.g. #f80 or #ff8800.",
      );
    }
  }

  function setFromRgb(channel: "r" | "g" | "b", value: number) {
    if (!formats) return;
    const next = { ...formats.rgb, [channel]: value };
    setHexInput(rgbToHex(next));
    setError(null);
  }

  function setFromHsl(channel: "h" | "s" | "l", value: number) {
    if (!formats) return;
    const next = { ...formats.hsl, [channel]: value };
    setHexInput(rgbToHex(hslToRgb(next)));
    setError(null);
  }

  return (
    <ToolLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="color-hex"
            className="mb-2 block text-sm font-medium"
          >
            HEX color
          </label>
          <input
            id="color-hex"
            value={hexInput}
            onChange={(e) => setFromHex(e.target.value)}
            placeholder="#4f46e5"
            spellCheck={false}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label
            htmlFor="color-picker"
            className="mb-2 block text-sm font-medium"
          >
            Picker
          </label>
          <input
            id="color-picker"
            type="color"
            value={formats?.hex ?? "#000000"}
            onChange={(e) => setFromHex(e.target.value)}
            className="h-11 w-16 cursor-pointer rounded-lg border border-border bg-background p-1"
            aria-label="Choose a color"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setFromHex(EXAMPLE)}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Example
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setFromHex("")}
            disabled={!hexInput}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {formats && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="h-20 w-20 shrink-0 rounded-2xl border border-border shadow-sm"
              style={{ backgroundColor: formats.hex }}
              role="img"
              aria-label={`Preview of ${formats.hex}`}
            />
            <div className="min-w-0 flex-1 space-y-2 text-sm">
              {(
                [
                  ["HEX", formats.hex],
                  ["RGB", formats.rgbString],
                  ["HSL", formats.hslString],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="w-10 shrink-0 font-medium text-muted-foreground">
                    {label}
                  </span>
                  <code className="min-w-0 font-mono break-all">{value}</code>
                  <CopyButton text={value} label="Copy" className="shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">RGB</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {(["r", "g", "b"] as const).map((channel) => (
                <label key={channel} className="text-xs text-muted-foreground">
                  <span className="mb-1 block font-medium uppercase">
                    {channel} · {formats.rgb[channel]}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={formats.rgb[channel]}
                    onChange={(e) =>
                      setFromRgb(channel, Number(e.target.value))
                    }
                    className="w-full accent-brand"
                    aria-label={`${channel.toUpperCase()} channel`}
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">HSL</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {(["h", "s", "l"] as const).map((channel) => (
                <label key={channel} className="text-xs text-muted-foreground">
                  <span className="mb-1 block font-medium uppercase">
                    {channel} · {formats.hsl[channel]}
                    {channel === "h" ? "°" : "%"}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={channel === "h" ? 360 : 100}
                    value={formats.hsl[channel]}
                    onChange={(e) =>
                      setFromHsl(channel, Number(e.target.value))
                    }
                    className="w-full accent-brand"
                    aria-label={`${channel.toUpperCase()} channel`}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
