"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleCheck,
  Download,
  FileArchive,
  LoaderCircle,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { downloadBlob } from "@/lib/utils/download";
import {
  FORMAT_MIME,
  clampDimensions,
  findQualityForTarget,
  formatBytes,
  formatFromMime,
  outputFilename,
  reductionPercent,
  type ImageFormat,
} from "@/lib/utils/image";

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  originalFormat: ImageFormat | null;
  status: "pending" | "processing" | "done" | "error";
  result?: { blob: Blob; format: ImageFormat; filename: string; note?: string };
  error?: string;
}

type FormatChoice = "keep" | ImageFormat;

const MAX_FILES = 50;
const MAX_DIMENSION_OPTIONS = [
  { label: "Original size", value: 0 },
  { label: "Max 1920px", value: 1920 },
  { label: "Max 1280px", value: 1280 },
  { label: "Max 800px", value: 800 },
] as const;

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `img-${Date.now()}-${idCounter}`;
}

/** Load a File into an ImageBitmap, honouring EXIF orientation. */
async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return createImageBitmap(file);
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
}

export function ImageCompressor() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [formatChoice, setFormatChoice] = useState<FormatChoice>("keep");
  const [mode, setMode] = useState<"quality" | "target">("quality");
  const [quality, setQuality] = useState(80);
  const [targetKb, setTargetKb] = useState(200);
  const [maxDimension, setMaxDimension] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const itemsRef = useRef<ImageItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Revoke preview URLs when the component unmounts.
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl);
    };
  }, []);

  function addFiles(files: File[]) {
    setNotice(null);
    const images = files.filter((f) => f.type.startsWith("image/"));
    const rejected = files.length - images.length;
    const room = MAX_FILES - items.length;
    const accepted = images.slice(0, Math.max(0, room));
    if (rejected > 0) {
      setNotice(`${rejected} file(s) skipped — only images are supported.`);
    }
    if (images.length > accepted.length) {
      setNotice(`Batch limit is ${MAX_FILES} images; extra files were skipped.`);
    }
    const newItems: ImageItem[] = accepted.map((file) => ({
      id: nextId(),
      file,
      previewUrl: URL.createObjectURL(file),
      originalFormat: formatFromMime(file.type),
      status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    for (const item of items) URL.revokeObjectURL(item.previewUrl);
    setItems([]);
    setProgress(null);
    setNotice(null);
  }

  async function processItem(item: ImageItem): Promise<ImageItem> {
    const format: ImageFormat =
      formatChoice === "keep" ? (item.originalFormat ?? "jpeg") : formatChoice;
    const bitmap = await loadBitmap(item.file);
    try {
      const { width, height } = clampDimensions(
        bitmap.width,
        bitmap.height,
        maxDimension || undefined,
      );
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available in this browser.");
      // JPEG has no transparency — flatten onto white.
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(bitmap, 0, 0, width, height);

      const mime = FORMAT_MIME[format];
      let blob: Blob | null;
      let note: string | undefined;

      if (mode === "target" && format !== "png") {
        const targetBytes = Math.max(1, targetKb) * 1024;
        const search = await findQualityForTarget(async (q) => {
          const b = await canvasToBlob(canvas, mime, q);
          return b ? b.size : Number.MAX_SAFE_INTEGER;
        }, targetBytes);
        blob = await canvasToBlob(canvas, mime, search.quality);
        if (!search.metTarget) {
          note = `Could not reach ${targetKb} KB even at low quality — this is the smallest result. Try a smaller max dimension.`;
        }
      } else {
        blob = await canvasToBlob(
          canvas,
          mime,
          format === "png" ? undefined : quality / 100,
        );
        if (mode === "target" && format === "png") {
          note = "PNG ignores quality settings, so target size does not apply. Choose JPG or WebP to hit a target size.";
        }
      }

      if (!blob) throw new Error("Encoding failed in this browser.");
      if (blob.type !== mime) {
        throw new Error(
          `This browser cannot encode ${format.toUpperCase()} (Safari cannot save WebP). Choose JPG or PNG instead.`,
        );
      }

      return {
        ...item,
        status: "done",
        error: undefined,
        result: {
          blob,
          format,
          filename: outputFilename(item.file.name, format, item.originalFormat),
          note,
        },
      };
    } finally {
      bitmap.close();
    }
  }

  async function processAll() {
    if (items.length === 0 || processing) return;
    setProcessing(true);
    setNotice(null);
    setProgress({ done: 0, total: items.length });
    const next = [...items];
    for (let i = 0; i < next.length; i++) {
      next[i] = { ...next[i], status: "processing", error: undefined };
      setItems([...next]);
      try {
        next[i] = await processItem(next[i]);
      } catch (err) {
        next[i] = {
          ...next[i],
          status: "error",
          error:
            err instanceof Error
              ? err.message
              : "Could not process this image.",
        };
      }
      setProgress({ done: i + 1, total: next.length });
      setItems([...next]);
    }
    setProcessing(false);
  }

  async function downloadAll() {
    const done = items.filter((i) => i.status === "done" && i.result);
    if (done.length === 0) return;
    if (done.length === 1) {
      downloadBlob(done[0].result!.blob, done[0].result!.filename);
      return;
    }
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    for (const item of done) {
      zip.file(item.result!.filename, item.result!.blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "tools-empire-images.zip");
  }

  const doneCount = items.filter((i) => i.status === "done").length;
  const totalBefore = items.reduce((sum, i) => sum + i.file.size, 0);
  const totalAfter = items.reduce(
    (sum, i) => sum + (i.result ? i.result.blob.size : 0),
    0,
  );

  return (
    <ToolLayout>
      <FileDropzone
        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif"
        multiple
        disabled={processing}
        onFiles={addFiles}
        label="Drop images here"
        hint="or click to browse — JPG, PNG, WebP and more. Files never leave your device."
      />
      {notice && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {notice}
        </p>
      )}

      {items.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="img-format" className="mb-1.5 block text-sm font-medium">
                Output format
              </label>
              <select
                id="img-format"
                value={formatChoice}
                onChange={(e) => setFormatChoice(e.target.value as FormatChoice)}
                disabled={processing}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="keep">Keep original format</option>
                <option value="jpeg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label htmlFor="img-maxdim" className="mb-1.5 block text-sm font-medium">
                Resize
              </label>
              <select
                id="img-maxdim"
                value={maxDimension}
                onChange={(e) => setMaxDimension(Number(e.target.value))}
                disabled={processing}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {MAX_DIMENSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="mt-4 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Compression mode"
          >
            <Button
              type="button"
              size="sm"
              variant={mode === "quality" ? "primary" : "secondary"}
              onClick={() => setMode("quality")}
              disabled={processing}
            >
              Quality slider
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "target" ? "primary" : "secondary"}
              onClick={() => setMode("target")}
              disabled={processing}
            >
              Target file size
            </Button>
          </div>

          {mode === "quality" ? (
            <div className="mt-3">
              <label htmlFor="img-quality" className="mb-1.5 block text-sm font-medium">
                Quality: {quality}%
              </label>
              <input
                id="img-quality"
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                disabled={processing}
                className="w-full accent-brand"
              />
              <p className="text-xs text-muted-foreground">
                80% is a good balance for photos. PNG output ignores this
                setting (PNG is lossless).
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <label htmlFor="img-target" className="mb-1.5 block text-sm font-medium">
                Target size per image (KB)
              </label>
              <input
                id="img-target"
                type="number"
                min={1}
                max={102400}
                value={targetKb}
                onChange={(e) => setTargetKb(Number(e.target.value))}
                disabled={processing}
                className="h-10 w-40 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Handy for application portals that reject files over a fixed
                size. Works with JPG/WebP output.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button type="button" onClick={processAll} disabled={processing}>
              {processing ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                "Compress images"
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={downloadAll}
              disabled={processing || doneCount === 0}
            >
              <FileArchive className="h-4 w-4" aria-hidden="true" />
              Download all{doneCount > 1 ? " (.zip)" : ""}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={clearAll}
              disabled={processing}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear all
            </Button>
            {progress && (
              <span className="text-sm text-muted-foreground" role="status">
                {progress.done} of {progress.total} processed
              </span>
            )}
          </div>

          {doneCount > 0 && (
            <p className="mt-3 text-sm text-muted-foreground" role="status">
              Total: {formatBytes(totalBefore)} → {formatBytes(totalAfter)}
              {totalBefore > 0 &&
                ` (${reductionPercent(totalBefore, totalAfter)}% smaller)`}
            </p>
          )}

          <ul className="mt-5 space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 rounded-xl border border-border bg-muted/40 p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote asset */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(item.file.size)}
                    {item.result &&
                      ` → ${formatBytes(item.result.blob.size)} (${reductionPercent(item.file.size, item.result.blob.size)}% smaller)`}
                  </p>
                  {item.status === "processing" && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      Processing…
                    </p>
                  )}
                  {item.status === "done" && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-green-700 dark:text-green-300">
                      <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Ready — {item.result!.filename}
                    </p>
                  )}
                  {item.result?.note && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.result.note}</p>
                  )}
                  {item.status === "error" && (
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-red-700 dark:text-red-300" role="alert">
                      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {item.error}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={!item.result || processing}
                    onClick={() =>
                      item.result &&
                      downloadBlob(item.result.blob, item.result.filename)
                    }
                    aria-label={`Download ${item.file.name}`}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={processing}
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </ToolLayout>
  );
}
