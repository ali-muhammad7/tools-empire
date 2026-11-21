/**
 * PDF operations built on pdf-lib — no React imports.
 *
 * Everything here works on raw bytes (Uint8Array) so the same code runs
 * in the browser component and in Node-based unit tests. All operations
 * are lossless page-level manipulations: merge, split, extract, reorder
 * and rotate never re-encode page content.
 *
 * Known pdf-lib limits (surfaced to the user, never hidden):
 * - Password-protected/encrypted PDFs cannot be opened.
 * - Very large files are bounded by device memory.
 */
import { PDFDocument, degrees } from "pdf-lib";

export interface SourcePdf {
  /** Caller-assigned id, stable for the lifetime of the editing session. */
  id: string;
  bytes: Uint8Array;
}

export interface PageRef {
  sourceId: string;
  /** Zero-based page index inside the source document. */
  pageIndex: number;
  /** Additional rotation in degrees (0, 90, 180 or 270), applied on top of the page's own rotation. */
  rotation: number;
}

export class PdfError extends Error {}

/** Load a PDF, converting pdf-lib failures into user-readable errors. */
export async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/encrypt/i.test(message)) {
      throw new PdfError(
        "This PDF is password-protected. Remove its password first, then try again.",
      );
    }
    throw new PdfError(
      "Could not open this file as a PDF. It may be corrupted or not a real PDF.",
    );
  }
}

/** Number of pages in a PDF. Throws PdfError for unreadable files. */
export async function getPageCount(bytes: Uint8Array): Promise<number> {
  const doc = await loadPdf(bytes);
  return doc.getPageCount();
}

/**
 * Build a new PDF from an ordered list of pages drawn from one or more
 * source documents. This single primitive implements merge (all pages of
 * several files), extract (a subset), reorder (any order) and rotate
 * (per-page extra rotation).
 */
export async function buildPdf(
  sources: SourcePdf[],
  pages: PageRef[],
): Promise<Uint8Array> {
  if (pages.length === 0) {
    throw new PdfError("There are no pages to save. Add at least one page first.");
  }
  const byId = new Map(sources.map((s) => [s.id, s]));
  const loaded = new Map<string, PDFDocument>();
  for (const source of sources) {
    loaded.set(source.id, await loadPdf(source.bytes));
  }

  const out = await PDFDocument.create();
  // Group consecutive pages per source for efficient copying, but keep the
  // requested order exactly — copyPages preserves the order of indices.
  for (const page of pages) {
    const doc = loaded.get(page.sourceId);
    if (!doc || !byId.has(page.sourceId)) {
      throw new PdfError("A page refers to a file that is no longer loaded.");
    }
    if (page.pageIndex < 0 || page.pageIndex >= doc.getPageCount()) {
      throw new PdfError("A page number is outside the document's range.");
    }
    const [copied] = await out.copyPages(doc, [page.pageIndex]);
    const extra = ((page.rotation % 360) + 360) % 360;
    if (extra !== 0) {
      const current = copied.getRotation().angle;
      copied.setRotation(degrees((current + extra) % 360));
    }
    out.addPage(copied);
  }
  return out.save();
}

/** Merge several PDFs into one, in the given order. */
export async function mergePdfs(files: Uint8Array[]): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new PdfError("Add at least one PDF to merge.");
  }
  const sources: SourcePdf[] = files.map((bytes, i) => ({
    id: `merge-${i}`,
    bytes,
  }));
  const pages: PageRef[] = [];
  for (const source of sources) {
    const count = await getPageCount(source.bytes);
    for (let i = 0; i < count; i++) {
      pages.push({ sourceId: source.id, pageIndex: i, rotation: 0 });
    }
  }
  return buildPdf(sources, pages);
}

/**
 * Split a PDF into one single-page PDF per page.
 * Returns the page files in order.
 */
export async function splitEveryPage(bytes: Uint8Array): Promise<Uint8Array[]> {
  const count = await getPageCount(bytes);
  const results: Uint8Array[] = [];
  for (let i = 0; i < count; i++) {
    results.push(
      await buildPdf(
        [{ id: "split", bytes }],
        [{ sourceId: "split", pageIndex: i, rotation: 0 }],
      ),
    );
  }
  return results;
}

/** Extract the given zero-based page indices into a new PDF (in the given order). */
export async function extractPages(
  bytes: Uint8Array,
  pageIndices: number[],
): Promise<Uint8Array> {
  return buildPdf(
    [{ id: "extract", bytes }],
    pageIndices.map((pageIndex) => ({
      sourceId: "extract",
      pageIndex,
      rotation: 0,
    })),
  );
}

/**
 * Parse a page-range string like "1-3, 5, 8-10" into sorted unique
 * zero-based indices. Throws PdfError with a readable message on bad input
 * or out-of-range pages.
 */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const trimmed = input.trim();
  if (trimmed === "") {
    throw new PdfError("Enter at least one page or range, e.g. 1-3, 5.");
  }
  const indices = new Set<number>();
  for (const rawPart of trimmed.split(",")) {
    const part = rawPart.trim();
    if (part === "") continue;
    const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) {
      throw new PdfError(`"${part}" is not a valid page or range. Use forms like 3 or 2-5.`);
    }
    const start = Number(match[1]);
    const end = match[2] !== undefined ? Number(match[2]) : start;
    if (start < 1 || end < start || end > pageCount) {
      throw new PdfError(
        `Pages must be between 1 and ${pageCount}; "${part}" is outside that range.`,
      );
    }
    for (let p = start; p <= end; p++) indices.add(p - 1);
  }
  if (indices.size === 0) {
    throw new PdfError("No pages selected.");
  }
  return [...indices].sort((a, b) => a - b);
}
