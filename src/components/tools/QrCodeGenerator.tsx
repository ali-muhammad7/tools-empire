"use client";

import { useEffect, useState } from "react";
import { Download, QrCode as QrCodeIcon } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";
import { ToolLayout } from "@/components/tools/ToolLayout";

type ErrorCorrection = "L" | "M" | "Q" | "H";

const EXAMPLE = "https://tools-empire.example";

export function QrCodeGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState<ErrorCorrection>("M");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Empty input shows the empty state; stale qrUrl is never displayed
    // when the input is empty (render guards on text), so no synchronous
    // setState is needed here — that form is a lint error.
    if (text.trim() === "") return;
    let cancelled = false;
    QRCode.toDataURL(text, {
      width: size,
      errorCorrectionLevel: level,
      margin: 2,
    })
      .then((url) => {
        if (!cancelled) {
          setQrUrl(url);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrUrl(null);
          setError(
            "Could not generate a QR code for this input — it may be too long for the chosen error-correction level. Try a shorter text or a lower level.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [text, size, level]);

  return (
    <ToolLayout>
      <label htmlFor="qr-input" className="mb-2 block text-sm font-medium">
        Text or URL
      </label>
      <textarea
        id="qr-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a URL or any text…"
        rows={3}
        className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="qr-size"
            className="flex justify-between text-sm font-medium"
          >
            <span>Image size</span>
            <span className="tabular-nums">{size} × {size} px</span>
          </label>
          <input
            id="qr-size"
            type="range"
            min={128}
            max={1024}
            step={64}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="mt-2 w-full accent-brand"
          />
        </div>
        <div>
          <label
            htmlFor="qr-level"
            className="mb-2 block text-sm font-medium"
          >
            Error correction
          </label>
          <select
            id="qr-level"
            value={level}
            onChange={(e) => setLevel(e.target.value as ErrorCorrection)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="L">Low (L) — ~7% recovery</option>
            <option value="M">Medium (M) — ~15% recovery</option>
            <option value="Q">Quartile (Q) — ~25% recovery</option>
            <option value="H">High (H) — ~30% recovery</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setText(EXAMPLE)}
        >
          Example
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setText("")}
          disabled={!text}
        >
          Clear
        </Button>
      </div>

      <div className="mt-6 flex flex-col items-center">
        {text.trim() !== "" && qrUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`QR code for ${text}`}
              width={Math.min(size, 320)}
              height={Math.min(size, 320)}
              className="max-w-full rounded-xl border border-border bg-white p-2 h-auto"
            />
            <a
              href={qrUrl}
              download="qr-code.png"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download PNG ({size} × {size})
            </a>
          </>
        ) : (
          <div className="flex w-full flex-col items-center rounded-xl border border-dashed border-border bg-muted/50 px-6 py-12 text-center">
            <QrCodeIcon
              className="h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              {error ?? "Enter text or a URL above to see your QR code here."}
            </p>
          </div>
        )}
        {error && qrUrl === null && text.trim() !== "" && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
