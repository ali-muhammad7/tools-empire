import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  PdfError,
  buildPdf,
  extractPages,
  getPageCount,
  mergePdfs,
  parsePageRanges,
  splitEveryPage,
} from "../pdf";

/** Create a real PDF with `n` blank pages of distinct widths (100+i). */
async function makePdf(n: number, widthBase = 100): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < n; i++) {
    doc.addPage([widthBase + i, 200]);
  }
  return doc.save();
}

describe("getPageCount", () => {
  it("counts pages", async () => {
    expect(await getPageCount(await makePdf(3))).toBe(3);
  });

  it("throws a friendly error for non-PDF bytes", async () => {
    await expect(getPageCount(new TextEncoder().encode("not a pdf"))).rejects.toBeInstanceOf(
      PdfError,
    );
  });
});

describe("mergePdfs", () => {
  it("merges page counts in order", async () => {
    const a = await makePdf(2, 100);
    const b = await makePdf(3, 300);
    const merged = await mergePdfs([a, b]);
    expect(await getPageCount(merged)).toBe(5);
    const doc = await PDFDocument.load(merged);
    expect(doc.getPage(0).getWidth()).toBe(100);
    expect(doc.getPage(2).getWidth()).toBe(300);
    expect(doc.getPage(4).getWidth()).toBe(302);
  });

  it("rejects an empty list", async () => {
    await expect(mergePdfs([])).rejects.toThrow(/at least one PDF/);
  });
});

describe("extractPages", () => {
  it("extracts selected pages in the given order", async () => {
    const pdf = await makePdf(4, 100);
    const out = await extractPages(pdf, [2, 0]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
    expect(doc.getPage(0).getWidth()).toBe(102);
    expect(doc.getPage(1).getWidth()).toBe(100);
  });

  it("rejects out-of-range pages", async () => {
    const pdf = await makePdf(2);
    await expect(extractPages(pdf, [5])).rejects.toThrow(/outside/);
  });
});

describe("splitEveryPage", () => {
  it("returns one single-page PDF per page", async () => {
    const pdf = await makePdf(3, 100);
    const parts = await splitEveryPage(pdf);
    expect(parts).toHaveLength(3);
    for (const [i, part] of parts.entries()) {
      const doc = await PDFDocument.load(part);
      expect(doc.getPageCount()).toBe(1);
      expect(doc.getPage(0).getWidth()).toBe(100 + i);
    }
  });
});

describe("buildPdf", () => {
  it("applies extra rotation on top of the page rotation", async () => {
    const pdf = await makePdf(1);
    const out = await buildPdf(
      [{ id: "a", bytes: pdf }],
      [{ sourceId: "a", pageIndex: 0, rotation: 90 }],
    );
    const doc = await PDFDocument.load(out);
    expect(doc.getPage(0).getRotation().angle).toBe(90);
  });

  it("normalizes rotation beyond 360", async () => {
    const pdf = await makePdf(1);
    const out = await buildPdf(
      [{ id: "a", bytes: pdf }],
      [{ sourceId: "a", pageIndex: 0, rotation: 450 }],
    );
    const doc = await PDFDocument.load(out);
    expect(doc.getPage(0).getRotation().angle).toBe(90);
  });

  it("rejects an empty page list", async () => {
    const pdf = await makePdf(1);
    await expect(buildPdf([{ id: "a", bytes: pdf }], [])).rejects.toThrow(/no pages/);
  });

  it("rejects unknown source ids", async () => {
    const pdf = await makePdf(1);
    await expect(
      buildPdf([{ id: "a", bytes: pdf }], [{ sourceId: "b", pageIndex: 0, rotation: 0 }]),
    ).rejects.toThrow(/no longer loaded/);
  });
});

describe("parsePageRanges", () => {
  it("parses singles and ranges into zero-based indices", () => {
    expect(parsePageRanges("1-3, 5, 8-9", 10)).toEqual([0, 1, 2, 4, 7, 8]);
  });

  it("deduplicates and sorts", () => {
    expect(parsePageRanges("5, 1-2, 2", 10)).toEqual([0, 1, 4]);
  });

  it("rejects empty input", () => {
    expect(() => parsePageRanges("  ", 10)).toThrow(/at least one/);
  });

  it("rejects malformed parts", () => {
    expect(() => parsePageRanges("a-b", 10)).toThrow(/not a valid/);
    expect(() => parsePageRanges("3-", 10)).toThrow(/not a valid/);
  });

  it("rejects out-of-range pages", () => {
    expect(() => parsePageRanges("11", 10)).toThrow(/between 1 and 10/);
    expect(() => parsePageRanges("0", 10)).toThrow(/between 1 and 10/);
    expect(() => parsePageRanges("5-3", 10)).toThrow(/between 1 and 10/);
  });
});
