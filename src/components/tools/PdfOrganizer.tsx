"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileArchive,
  LoaderCircle,
  RotateCcw,
  RotateCw,
  Scissors,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { downloadBlob, downloadBytes } from "@/lib/utils/download";
import { formatBytes } from "@/lib/utils/image";
import {
  buildPdf,
  getPageCount,
  parsePageRanges,
  type PageRef,
} from "@/lib/utils/pdf";

interface SourceFile {
  id: string;
  name: string;
  bytes: Uint8Array;
  pageCount: number;
}

interface PageItem {
  key: string;
  sourceId: string;
  pageIndex: number;
  rotation: number;
  selected: boolean;
  thumb?: string;
}

const MAX_THUMBNAILS = 120;
const SIZE_WARNING_BYTES = 100 * 1024 * 1024;

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

async function loadPdfjs(): Promise<PdfJsModule> {
  // The legacy build ships polyfills (e.g. Uint8Array.prototype.toHex)
  // that the modern build assumes — without them, PDF.js fails on
  // browsers that lack those very new builtins.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  return pdfjs;
}

export function PdfOrganizer() {
  const [sources, setSources] = useState<SourceFile[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [dragKey, setDragKey] = useState<string | null>(null);
  const pdfjsRef = useRef<PdfJsModule | null>(null);

  const totalBytes = sources.reduce((sum, s) => sum + s.bytes.length, 0);
  const selectedCount = pages.filter((p) => p.selected).length;

  /** Render one page thumbnail (small JPEG data URL) via PDF.js. */
  async function renderThumb(
    bytes: Uint8Array,
    pageIndex: number,
    extraRotation: number,
  ): Promise<string | undefined> {
    try {
      if (!pdfjsRef.current) pdfjsRef.current = await loadPdfjs();
      const pdfjs = pdfjsRef.current;
      // PDF.js transfers the buffer to its worker — always pass a copy.
      const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
      const doc = await loadingTask.promise;
      try {
        const page = await doc.getPage(pageIndex + 1);
        const rotation = (page.rotate + extraRotation) % 360;
        const viewport = page.getViewport({ scale: 0.35, rotation });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) return undefined;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        return canvas.toDataURL("image/jpeg", 0.7);
      } finally {
        await loadingTask.destroy();
      }
    } catch (err) {
      // Thumbnail failures must never break the tool — pages still work
      // without previews. Log for diagnosability.
      console.error(
        "PDF thumbnail render failed:",
        err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      );
      return undefined;
    }
  }

  async function addFiles(files: File[]) {
    setError(null);
    const pdfFiles = files.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (pdfFiles.length === 0) {
      setError("Please choose PDF files — other file types are not supported here.");
      return;
    }
    setBusy("Reading PDFs…");
    const newSources: SourceFile[] = [];
    const newPages: PageItem[] = [];
    const failures: string[] = [];

    for (const file of pdfFiles) {
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const pageCount = await getPageCount(bytes);
        const source: SourceFile = {
          id: nextId("src"),
          name: file.name,
          bytes,
          pageCount,
        };
        newSources.push(source);
        for (let i = 0; i < pageCount; i++) {
          newPages.push({
            key: nextId("page"),
            sourceId: source.id,
            pageIndex: i,
            rotation: 0,
            selected: false,
          });
        }
      } catch (err) {
        failures.push(
          `${file.name}: ${err instanceof Error ? err.message : "could not be opened."}`,
        );
      }
    }

    const allSources = [...sources, ...newSources];
    const allPages = [...pages, ...newPages];
    setSources(allSources);
    setPages(allPages);
    if (failures.length > 0) setError(failures.join(" "));

    // Render thumbnails for the new pages (capped to protect memory).
    const thumbBudget = Math.max(0, MAX_THUMBNAILS - pages.length);
    const toRender = newPages.slice(0, thumbBudget);
    if (toRender.length > 0) {
      const sourceById = new Map(allSources.map((s) => [s.id, s]));
      for (let i = 0; i < toRender.length; i++) {
        setBusy(`Rendering page previews ${i + 1} of ${toRender.length}…`);
        const pageItem = toRender[i];
        const source = sourceById.get(pageItem.sourceId);
        if (!source) continue;
        const thumb = await renderThumb(source.bytes, pageItem.pageIndex, 0);
        if (thumb) {
          setPages((prev) =>
            prev.map((p) => (p.key === pageItem.key ? { ...p, thumb } : p)),
          );
        }
      }
    }
    setBusy(null);
  }

  function removeSource(id: string) {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setPages((prev) => prev.filter((p) => p.sourceId !== id));
  }

  function clearAll() {
    setSources([]);
    setPages([]);
    setError(null);
    setRangeInput("");
  }

  function movePage(key: string, direction: -1 | 1) {
    setPages((prev) => {
      const index = prev.findIndex((p) => p.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function dropOnPage(targetKey: string) {
    if (!dragKey || dragKey === targetKey) return;
    setPages((prev) => {
      const from = prev.findIndex((p) => p.key === dragKey);
      const to = prev.findIndex((p) => p.key === targetKey);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragKey(null);
  }

  async function rotatePage(key: string) {
    const pageItem = pages.find((p) => p.key === key);
    if (!pageItem) return;
    const rotation = (pageItem.rotation + 90) % 360;
    setPages((prev) =>
      prev.map((p) => (p.key === key ? { ...p, rotation } : p)),
    );
    const source = sources.find((s) => s.id === pageItem.sourceId);
    if (source) {
      const thumb = await renderThumb(source.bytes, pageItem.pageIndex, rotation);
      if (thumb) {
        setPages((prev) =>
          prev.map((p) => (p.key === key ? { ...p, thumb } : p)),
        );
      }
    }
  }

  function removePage(key: string) {
    setPages((prev) => prev.filter((p) => p.key !== key));
  }

  function toggleSelected(key: string) {
    setPages((prev) =>
      prev.map((p) => (p.key === key ? { ...p, selected: !p.selected } : p)),
    );
  }

  function selectByRange() {
    setError(null);
    try {
      const indices = parsePageRanges(rangeInput, pages.length);
      const chosen = new Set(indices);
      setPages((prev) =>
        prev.map((p, i) => ({ ...p, selected: chosen.has(i) })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid page range.");
    }
  }

  function toPageRefs(list: PageItem[]): PageRef[] {
    return list.map((p) => ({
      sourceId: p.sourceId,
      pageIndex: p.pageIndex,
      rotation: p.rotation,
    }));
  }

  async function downloadOrganized() {
    setError(null);
    setBusy("Building your PDF…");
    try {
      const bytes = await buildPdf(sources, toPageRefs(pages));
      downloadBytes(bytes, "organized.pdf", "application/pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the PDF.");
    } finally {
      setBusy(null);
    }
  }

  async function downloadSelected() {
    setError(null);
    const chosen = pages.filter((p) => p.selected);
    if (chosen.length === 0) {
      setError("Select at least one page first (tick its checkbox).");
      return;
    }
    setBusy("Extracting selected pages…");
    try {
      const bytes = await buildPdf(sources, toPageRefs(chosen));
      downloadBytes(bytes, "extracted-pages.pdf", "application/pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not extract pages.");
    } finally {
      setBusy(null);
    }
  }

  async function downloadSplit() {
    setError(null);
    setBusy("Splitting into single pages…");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (let i = 0; i < pages.length; i++) {
        setBusy(`Splitting page ${i + 1} of ${pages.length}…`);
        const bytes = await buildPdf(sources, toPageRefs([pages[i]]));
        zip.file(`page-${String(i + 1).padStart(3, "0")}.pdf`, bytes);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "split-pages.zip");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not split the PDF.");
    } finally {
      setBusy(null);
    }
  }

  const isBusy = busy !== null;

  return (
    <ToolLayout>
      <FileDropzone
        accept="application/pdf,.pdf"
        multiple
        disabled={isBusy}
        onFiles={addFiles}
        label="Drop PDF files here"
        hint="or click to browse — add several PDFs to merge them. Files never leave your device."
      />

      {totalBytes > SIZE_WARNING_BYTES && (
        <p className="mt-3 flex gap-2 text-sm text-amber-700 dark:text-amber-300" role="status">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Large files loaded ({formatBytes(totalBytes)}). Processing happens
          in your browser&apos;s memory — on low-memory devices this may be
          slow or fail. Working with fewer pages at a time helps.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 flex gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {sources.length > 0 && (
        <>
          <ul className="mt-5 space-y-2" aria-label="Loaded PDF files">
            {sources.map((source) => (
              <li
                key={source.id}
                className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {source.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {source.pageCount} {source.pageCount === 1 ? "page" : "pages"} ·{" "}
                  {formatBytes(source.bytes.length)}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isBusy}
                  onClick={() => removeSource(source.id)}
                  aria-label={`Remove ${source.name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button type="button" onClick={downloadOrganized} disabled={isBusy || pages.length === 0}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download organized PDF
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={downloadSelected}
              disabled={isBusy || selectedCount === 0}
            >
              <Scissors className="h-4 w-4" aria-hidden="true" />
              Extract selected ({selectedCount})
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={downloadSplit}
              disabled={isBusy || pages.length === 0}
            >
              <FileArchive className="h-4 w-4" aria-hidden="true" />
              Split every page (.zip)
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isBusy || pages.length === 0}
              onClick={() => setPages((prev) => [...prev].reverse())}
            >
              Reverse order
            </Button>
            <Button type="button" variant="secondary" disabled={isBusy} onClick={clearAll}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear all
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label htmlFor="pdf-range" className="text-sm font-medium">
              Select pages by position:
            </label>
            <input
              id="pdf-range"
              type="text"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder="e.g. 1-3, 5"
              disabled={isBusy}
              className="h-9 w-44 rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="button" size="sm" variant="secondary" disabled={isBusy} onClick={selectByRange}>
              Select
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isBusy}
              onClick={() =>
                setPages((prev) => prev.map((p) => ({ ...p, selected: false })))
              }
            >
              Clear selection
            </Button>
          </div>

          {busy && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              {busy}
            </p>
          )}

          <p className="mt-4 text-sm text-muted-foreground">
            {pages.length} {pages.length === 1 ? "page" : "pages"} in the
            working order. Drag pages to reorder, or use the arrow buttons.
            Tick pages to extract them into a separate PDF.
          </p>

          <ul
            className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            aria-label="PDF pages in working order"
          >
            {pages.map((pageItem, index) => {
              const source = sources.find((s) => s.id === pageItem.sourceId);
              return (
                <li
                  key={pageItem.key}
                  draggable={!isBusy}
                  onDragStart={() => setDragKey(pageItem.key)}
                  onDragEnd={() => setDragKey(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dropOnPage(pageItem.key)}
                  className={`rounded-xl border bg-muted/40 p-2 ${
                    dragKey === pageItem.key
                      ? "border-brand opacity-60"
                      : "border-border"
                  }`}
                >
                  <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-background">
                    {pageItem.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local canvas thumbnail
                      <img
                        src={pageItem.thumb}
                        alt={`Page ${pageItem.pageIndex + 1} of ${source?.name ?? "PDF"}`}
                        className="max-h-full max-w-full object-contain"
                        draggable={false}
                      />
                    ) : (
                      <span className="px-2 text-center text-xs text-muted-foreground">
                        Page {pageItem.pageIndex + 1}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-xs font-medium">
                    #{index + 1} · {source?.name ?? ""} p.{pageItem.pageIndex + 1}
                    {pageItem.rotation !== 0 && ` · ${pageItem.rotation}°`}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    <label className="flex cursor-pointer items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={pageItem.selected}
                        onChange={() => toggleSelected(pageItem.key)}
                        disabled={isBusy}
                        className="h-4 w-4 accent-brand"
                        aria-label={`Select page ${index + 1}`}
                      />
                      Select
                    </label>
                    <span className="flex-1" />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      disabled={isBusy || index === 0}
                      onClick={() => movePage(pageItem.key, -1)}
                      aria-label={`Move page ${index + 1} earlier`}
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      disabled={isBusy || index === pages.length - 1}
                      onClick={() => movePage(pageItem.key, 1)}
                      aria-label={`Move page ${index + 1} later`}
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      disabled={isBusy}
                      onClick={() => rotatePage(pageItem.key)}
                      aria-label={`Rotate page ${index + 1}`}
                    >
                      <RotateCw className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      disabled={isBusy}
                      onClick={() => removePage(pageItem.key)}
                      aria-label={`Remove page ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>

          {pages.length > MAX_THUMBNAILS && (
            <p className="mt-3 text-xs text-muted-foreground">
              Previews are shown for the first {MAX_THUMBNAILS} pages to keep
              memory in check — all {pages.length} pages are still included
              when you download.
            </p>
          )}
        </>
      )}
    </ToolLayout>
  );
}
